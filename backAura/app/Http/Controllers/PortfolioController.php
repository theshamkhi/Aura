<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioController extends Controller
{
    /**
     * Display the single portfolio with all relationships.
     */
    public function show()
    {
        $portfolio = Portfolio::firstOrFail()->load([
            'owner', 
            'projects', 
            'skills', 
            'achievements', 
            'statistics',
            'apis',
            'messages',
            'visitors'
        ]);

        return response()->json([
            'status' => 'success',
            'portfolio' => $portfolio
        ]);
    }

    /**
     * Update the single portfolio.
     */
    public function update(Request $request)
    {
        $portfolio = Portfolio::firstOrFail();

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'slug' => 'sometimes|string|max:255|unique:portfolios,slug,'.$portfolio->id
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
            'portfolio' => $portfolio->fresh()
        ]);
    }

    /**
     * Get the owner's details for the portfolio
     */
    public function owner()
    {
        $portfolio = Portfolio::with('owner')->firstOrFail();
        
        return response()->json([
            'status' => 'success',
            'owner' => $portfolio->owner
        ]);
    }

    /**
     * Update the owner's details
     */
    public function updateOwner(Request $request)
    {
        $portfolio = Portfolio::with('owner')->firstOrFail();
        $owner = $portfolio->owner;

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$owner->id,
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'job' => 'sometimes|string|max:255',
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
            $data['photo'] = $request->file('photo')->store('user/photo', 'public');
        }

        if ($request->hasFile('cv')) {
            if ($owner->cv) {
                Storage::disk('public')->delete($owner->cv);
            }
            $data['cv'] = $request->file('cv')->store('user/cv', 'public');
        }

        $owner->update($data);

        return response()->json([
            'status' => 'success',
            'owner' => $owner->fresh()
        ]);
    }
}