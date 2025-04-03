<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',

        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get authenticated user details
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['portfolio' => function($query) {
                $query->withCount(['projects', 'skills', 'achievements']);
            }])
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'job' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'country' => 'nullable|string|max:100',
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        $data = $request->except(['photo', 'cv']);
    
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('user/photo', 'public');
            $data['photo'] = $path;
            
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
        }
    
        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('user/cv', 'public');
            $data['cv'] = $path;
            
            if ($user->cv) {
                Storage::disk('public')->delete($user->cv);
            }
        }
    
        $user->update($data);
    
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()
        ]);
    }

}