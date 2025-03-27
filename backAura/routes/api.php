<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PortfolioController;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::apiResource('portfolios', PortfolioController::class);
Route::get('portfolios/{portfolio}/owner', [PortfolioController::class, 'owner']);
Route::get('portfolios/{portfolio}/projects', [PortfolioController::class, 'projects']);
Route::get('portfolios/{portfolio}/skills', [PortfolioController::class, 'skills']);
Route::get('portfolios/{portfolio}/achievements', [PortfolioController::class, 'achievements']);
Route::get('portfolios/{portfolio}/statistics', [PortfolioController::class, 'statistics']);
Route::get('portfolios/{portfolio}/apis', [PortfolioController::class, 'apis']);

Route::apiResource('projects', ProjectController::class);
Route::get('projects/category/{category}', [ProjectController::class, 'filterByCategory']);
Route::get('projects/technology/{skill}', [ProjectController::class, 'filterByTechnology']);
