<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

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
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'job' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
            'country' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'password' => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()]
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except(['photo', 'cv', 'password']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        foreach (['photo', 'cv'] as $fileField) {
            if ($request->hasFile($fileField)) {
                $path = $request->file($fileField)->store($fileField.'s', 'public');
                $data[$fileField] = $path;
                
                if ($user->$fileField) {
                    Storage::disk('public')->delete($user->$fileField);
                }
            }
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()
        ]);
    }
}