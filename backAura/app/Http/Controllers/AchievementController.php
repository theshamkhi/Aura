<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AchievementController extends Controller
{
    /**
     * Public: List achievements for a portfolio
     */
    public function index(Portfolio $portfolio)
    {
        $achievements = $portfolio->achievements()
            ->latest()
            ->get(['id', 'title', 'description', 'image_url', 'date', 'created_at']);

        return response()->json([
            'status' => 'success',
            'achievements' => $achievements
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
            'achievement' => $achievement->only(['id', 'title', 'description', 'image_url', 'date', 'created_at'])
        ]);
    }

    /**
     * Store a new achievement (protected)
     */
    public function store(Request $request)
    {
        $portfolio = Auth::user()->portfolio;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|url',
            'date' => 'required|date'
        ]);

        $validated['portfolio_id'] = $portfolio->id;
        
        $achievement = Achievement::create($validated);

        return response()->json([
            'status' => 'success',
            'achievement' => $achievement->only(['id', 'title', 'description', 'image_url', 'date'])
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

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image_url' => 'nullable|url',
            'date' => 'sometimes|date'
        ]);

        $achievement->update($validated);
        $achievement->refresh();

        return response()->json([
            'status' => 'success',
            'achievement' => $achievement->only(['id', 'title', 'description', 'image_url', 'date'])
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
}