<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Display the authenticated user's portfolio
     */
    public function show()
    {
        $portfolio = Auth::user()->portfolio->load([
            'owner',
            'projects.technologies',
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
     * Get the portfolio owner's details
     */
    public function owner()
    {
        return response()->json([
            'status' => 'success',
            'owner' => Auth::user()->portfolio->owner
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