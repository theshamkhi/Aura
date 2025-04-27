<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register User & Create his Portfolio
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'username' => 'required|string|unique:users',
            'password' => 'required|min:8',
            'job' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();
            
            $user = User::create($validated);
            $user->portfolio()->create([
                'title' => "{$user->name}'s Portfolio",
                'owner_id' => $user->id
            ]);
            
            DB::commit();
            
            return response()->json([
                'user' => $user->only('id', 'name', 'email', 'username', 'job'),
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Registration failed' . $e], 500);
        }
    }


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
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
    
        $user = $request->user();
        $token = $user->createToken('aura_token')->plainTextToken;
    
        $user->load(['portfolio' => function($query) {
            $query->with(['projects', 'skills', 'achievements', 'visitors', 'messages']);
        }]);
    
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
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get authenticated user details
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['portfolio' => function($query) {
            $query->with(['projects', 'skills', 'achievements', 'visitors', 'messages']);
        }]);
        return response()->json(['user' => $user]);
    }
}