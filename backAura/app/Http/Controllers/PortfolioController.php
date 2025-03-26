<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Display a listing of portfolios.
    */
    public function index()
    {
        $portfolios = Portfolio::with(['owner', 'projects', 'skills', 'achievements'])->latest()->get();
        return response()->json([
            'status' => 'success',
            'portfolios' => $portfolios
        ]);
    }

    /**
     * Store a newly created portfolio.
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'owner_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('portfolios', 'public');
            $data['image'] = $path;
        }

        $portfolio = Portfolio::create($data);

        return response()->json([
            'status' => 'success',
            'portfolio' => $portfolio
        ], 201);
    }

    /**
     * Display the specified portfolio with all relationships.
    */
    public function show(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'portfolio' => $portfolio->load([
                'owner', 
                'projects', 
                'skills', 
                'achievements', 
                'statistics',
                'apis'
            ])
        ]);
    }

    /**
     * Update the specified portfolio.
    */
    public function update(Request $request, Portfolio $portfolio)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'owner_id' => 'sometimes|exists:users,id'
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
            
            $path = $request->file('image')->store('portfolios', 'public');
            $data['image'] = $path;
        }

        $portfolio->update($data);

        return response()->json([
            'status' => 'success',
            'portfolio' => $portfolio
        ]);
    }

    /**
     * Remove the specified portfolio and related data.
    */
    public function destroy(Portfolio $portfolio)
    {
        if ($portfolio->image) {
            Storage::disk('public')->delete($portfolio->image);
        }

        $portfolio->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Portfolio deleted successfully'
        ]);
    }

    /**
     * Get the owner's details for this portfolio
    */
    public function owner(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'owner' => $portfolio->owner
        ]);
    }

    /**
     * Get all projects for this portfolio
    */
    public function projects(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'projects' => $portfolio->projects()->with('skills')->get()
        ]);
    }

    /**
     * Get all skills for this portfolio
    */
    public function skills(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'skills' => $portfolio->skills
        ]);
    }

    /**
     * Get all achievements for this portfolio
    */
    public function achievements(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'achievements' => $portfolio->achievements
        ]);
    }

    /**
     * Get statistics for this portfolio
    */
    public function statistics(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'statistics' => $portfolio->statistics
        ]);
    }

    /**
     * Get APIs connected to this portfolio
    */
    public function apis(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'apis' => $portfolio->apis
        ]);
    }
}