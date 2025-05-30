<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{   
    /**
     * Display all public projects of a portfolio identified by username
     */
    public function index($username)
    {
        $portfolio = $this->findPortfolioByUsername($username);
        
        return response()->json([
            'projects' => $portfolio->projects()
                ->with('technologies')
                ->latest()
                ->get()
        ]);
    }

    /**
     * Display certain project of a certain Portfolio
     */
    public function show($username, Project $project)
    {
        $portfolio = $this->findPortfolioByUsername($username);

        if ($project->portfolio_id !== $portfolio->id) {
            abort(404, 'Project not found in this portfolio');
        }

        return response()->json([
            'project' => $project->load('technologies')
        ]);
    }
    
    /**
     * Filter Projects by Technology
     */
    public function filterByTechnology($username, Skill $skill)
    {
        $portfolio = $this->findPortfolioByUsername($username);

        if ($skill->portfolio_id !== $portfolio->id) {
            abort(404, 'Skill not found in this portfolio');
        }

        return response()->json([
            'projects' => $skill->projects()->with('technologies')->get()
        ]);
    }

    /**
     * Store newly created Project
     */
    public function store(Request $request)
    {
        $portfolio = Auth::user()->portfolio;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|url|string',
            'category' => 'required|string|max:255',
            'date' => 'required|date',
            'source_code_url' => 'nullable|url',
            'live_site_url' => 'nullable|url',
            'skills' => 'nullable|array',
            'skills.*' => [
                Rule::exists('skills', 'id')->where('portfolio_id', $portfolio->id)
            ]
        ]);

        $data = $request->except('skills');
        $data['portfolio_id'] = $portfolio->id;

        $project = Project::create($data);

        if ($request->has('skills')) {
            $project->technologies()->sync($validated['skills']);
        }

        return response()->json([
            'status' => 'success',
            'project' => $project->load('technologies')
        ], 201);
    }

    /**
     * Update existing Project
     */
    public function update(Request $request, Project $project)
    {
        $portfolio = Auth::user()->portfolio;

        if ($project->portfolio_id !== $portfolio->id) {
            abort(403, 'Unauthorized action');
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image_url' => 'nullable|url|string',
            'category' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'source_code_url' => 'nullable|url',
            'live_site_url' => 'nullable|url',
            'skills' => 'nullable|array',
            'skills.*' => [
                Rule::exists('skills', 'id')->where('portfolio_id', $portfolio->id)
            ]
        ]);

        $data = $request->except('skills');

        $project->update($data);

        if ($request->has('skills')) {
            $project->technologies()->syncWithoutDetaching($validated['skills']);
        }

        return response()->json([
            'status' => 'success',
            'project' => $project->fresh()->load('technologies')
        ]);
    }

    /**
     * Delete certain Project
     */
    public function destroy(Project $project)
    {
        if ($project->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action');
        }
        
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}