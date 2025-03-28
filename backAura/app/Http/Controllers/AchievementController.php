<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AchievementController extends Controller
{
    /**
     * Display a listing of achievements.
    */
    public function index()
    {
        $achievements = Achievement::with('portfolio')->latest()->get();
        return response()->json([
            'status' => 'success',
            'achievements' => $achievements
        ]);
    }

    /**
     * Store a newly created achievement.
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|string',
            'date' => 'required|date',
            'portfolio_id' => 'required|exists:portfolios,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $achievement = Achievement::create($request->all());

        return response()->json([
            'status' => 'success',
            'achievement' => $achievement
        ], 201);
    }

    /**
     * Display the specified achievement.
    */
    public function show(Achievement $achievement)
    {
        return response()->json([
            'status' => 'success',
            'achievement' => $achievement->load('portfolio')
        ]);
    }

    /**
     * Update the specified achievement.
    */
    public function update(Request $request, Achievement $achievement)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image' => 'nullable|string',
            'date' => 'sometimes|date',
            'portfolio_id' => 'sometimes|exists:portfolios,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $achievement->update($request->all());

        return response()->json([
            'status' => 'success',
            'achievement' => $achievement
        ]);
    }

    /**
     * Remove the specified achievement.
    */
    public function destroy(Achievement $achievement)
    {
        $achievement->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Achievement deleted successfully'
        ]);
    }
}