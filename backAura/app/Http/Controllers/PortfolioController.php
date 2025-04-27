<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\ProjectView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class PortfolioController extends Controller
{
    /**
     * Public endpoint: Get portfolio details with statistics by username
     */
    public function show($username)
    {
        $portfolio = $this->findPortfolioByUsername($username);
        $portfolio->load('owner');
        
        return response()->json([
            'portfolio' => [
                'title' => $portfolio->title,
                'image' => $portfolio->image,
                'owner' => [
                    'name' => $portfolio->owner->name,
                    'username' => $portfolio->owner->username,
                    'job' => $portfolio->owner->job,
                    'email' => $portfolio->owner->email,
                    'cv' => $portfolio->owner->cv,
                    'socials' => $portfolio->owner->socials,
                    'bio' => $portfolio->owner->bio,
                    'photo' => $portfolio->owner->photo,
                    'country' => $portfolio->owner->country
                ],
                'stats' => $this->getPortfolioStats($portfolio)
            ]
        ]);
    }

    /**
     * Calculate comprehensive portfolio statistics
     */
    private function getPortfolioStats(Portfolio $portfolio)
    {
        $totalViews = ProjectView::whereIn('project_id', $portfolio->projects->pluck('id'))
            ->count();

        $projectsCount = $portfolio->projects()->count();
        $averageViews = $projectsCount > 0 ? round($totalViews / $projectsCount, 1) : 0;

        return [
            'projects' => $projectsCount,
            'skills' => $portfolio->skills()->count(),
            'achievements' => $portfolio->achievements()->count(),
            'visitors' => [
                'total' => $portfolio->visitors()->count(),
                'unique' => $portfolio->visitors()->distinct('session_id')->count(),
                'last_7_days' => $portfolio->visitors()
                    ->where('created_at', '>=', Carbon::now()->subDays(7))
                    ->count()
            ],
            'engagement' => [
                'total_views' => $totalViews,
                'average_views' => $averageViews,
                'popular_projects' => $portfolio->projects()
                    ->withCount('views')
                    ->orderByDesc('views_count')
                    ->take(3)
                    ->get()
                    ->map(fn($project) => [
                        'title' => $project->title,
                        'views' => $project->views_count,
                        'image' => $project->image_url
                    ])
            ],
            'messages' => $portfolio->messages()->count()
        ];
    }


    /**
     * Update the authenticated user's portfolio
     */
    public function update(Request $request)
    {
        $portfolio = Auth::user()->portfolio;

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');
        
        if ($request->hasFile('image')) {

            if ($portfolio->image) {
                Storage::disk('public')->delete($portfolio->image);
            }
            
            $path = $request->file('image')->store('portfolio', 'public');
            $data['image'] = $path;
        }

        $portfolio->update($data);

        return response()->json([
            'status' => 'success',
            'portfolio' => $portfolio->fresh()
        ]);
    }

    /**
     * Update the portfolio owner's details
     */
    public function updateOwner(Request $request)
    {
        $portfolio = Auth::user()->portfolio;
        $owner = $portfolio->owner;

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$owner->id,
            'username' => 'sometimes|string|max:255|unique:users,username,'.$owner->id,
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'job' => 'sometimes|string|max:255',
            'socials' => 'nullable|json',
            'bio' => 'nullable|string',
            'cv' => 'nullable|file|mimes:pdf|max:5120',
            'country' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('photo', 'cv');
        
        if ($request->hasFile('photo')) {
            if ($owner->photo) {
                Storage::disk('public')->delete($owner->photo);
            }
            $data['photo'] = $request->file('photo')->store('owner/photo', 'public');
        }

        if ($request->hasFile('cv')) {
            if ($owner->cv) {
                Storage::disk('public')->delete($owner->cv);
            }
            $data['cv'] = $request->file('cv')->store('owner/cv', 'public');
        }

        $owner->update($data);

        return response()->json([
            'status' => 'success',
            'owner' => $owner->fresh()
        ]);
    }

    /**
     * Delete the authenticated user's portfolio
     */
    public function destroy()
    {
        $portfolio = Auth::user()->portfolio;

        if ($portfolio->image) {
            Storage::disk('public')->delete($portfolio->image);
        }

        $portfolio->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Portfolio deleted successfully'
        ]);
    }
}