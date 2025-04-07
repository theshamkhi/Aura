<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AchievementController extends Controller
{
    /**
     * Public: List achievements for a portfolio
     */
    public function index(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'achievements' => $portfolio->achievements()
                ->latest()
                ->get()
                ->map(function($achievement) {
                    return [
                        'id' => $achievement->id,
                        'title' => $achievement->title,
                        'description' => $achievement->description,
                        'image_url' => $achievement->image_url,
                        'date' => $achievement->date,
                        'created_at' => $achievement->created_at
                    ];
                })
        ]);
    }

    /**
     * Public: Show single achievement
     */
    public function show(Portfolio $portfolio, Achievement $achievement)
    {
        if ($achievement->portfolio_id !== $portfolio->id) {
            abort(404, 'Achievement not found in this portfolio');
        }

        return response()->json([
            'status' => 'success',
            'achievement' => [
                'id' => $achievement->id,
                'title' => $achievement->title,
                'description' => $achievement->description,
                'image_url' => $achievement->image_url,
                'date' => $achievement->date,
                'created_at' => $achievement->created_at
            ]
        ]);
    }

    /**
     * Store a new achievement (protected)
     */
    public function store(Request $request)
    {
        $portfolio = Auth::user()->portfolio;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|url',
            'date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['portfolio_id'] = $portfolio->id;

        $achievement = Achievement::create($data);

        return response()->json([
            'status' => 'success',
            'achievement' => $this->formatAchievement($achievement)
        ], 201);
    }

    /**
     * Update achievement (protected)
     */
    public function update(Request $request, Achievement $achievement)
    {
        if ($achievement->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action');
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image_url' => 'nullable|url',
            'date' => 'sometimes|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $achievement->update($validator->validated());

        return response()->json([
            'status' => 'success',
            'achievement' => $this->formatAchievement($achievement->fresh())
        ]);
    }

    /**
     * Delete achievement (protected)
     */
    public function destroy(Achievement $achievement)
    {
        if ($achievement->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action');
        }

        $achievement->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Achievement deleted successfully'
        ]);
    }

    /**
     * Format achievement response
     */
    private function formatAchievement(Achievement $achievement)
    {
        return [
            'id' => $achievement->id,
            'title' => $achievement->title,
            'description' => $achievement->description,
            'image_url' => $achievement->image_url,
            'date' => $achievement->date
        ];
    }
}