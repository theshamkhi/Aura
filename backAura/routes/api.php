<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ProjectViewController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GitHubController;


// A U T H
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

// P O R T F O L I O
Route::get('/{username}/portfolio', [PortfolioController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/portfolio', [PortfolioController::class, 'update']);
    Route::post('/portfolio/owner', [PortfolioController::class, 'updateOwner']);
    Route::delete('/portfolio', [PortfolioController::class, 'destroy']);
});

// P R O J E C T S  &  V I E W S
Route::get('/{username}/projects', [ProjectController::class, 'index']);
Route::get('/{username}/projects/{project}', [ProjectController::class, 'show']);
Route::get('/{username}/skills/{skill}/projects', [ProjectController::class, 'filterByTechnology']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
});
Route::post('/projects/{project}/views', [ProjectViewController::class, 'trackView']);
Route::get('/projects/{project}/stats', [ProjectViewController::class, 'projectStats']);

// S K I L L S
Route::get('/{username}/skills', [SkillController::class, 'index']);
Route::get('/{username}/skills/{skill}', [SkillController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/skills', [SkillController::class, 'store']);
    Route::put('/skills/{skill}', [SkillController::class, 'update']);
    Route::post('/skills/{skill}/attach', [SkillController::class, 'attachToProject']);
    Route::post('/skills/{skill}/detach', [SkillController::class, 'detachFromProject']);
    Route::delete('/skills/{skill}', [SkillController::class, 'destroy']);
});

// A C H I E V E M E N T S
Route::get('/{username}/achievements', [AchievementController::class, 'index']);
Route::get('/{username}/achievements/{achievement}', [AchievementController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/achievements', [AchievementController::class, 'store']);
    Route::put('/achievements/{achievement}', [AchievementController::class, 'update']);
    Route::delete('/achievements/{achievement}', [AchievementController::class, 'destroy']);
});

// V I S I T O R S
Route::post('/{username}/track', [VisitorController::class, 'track']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/visitors', [VisitorController::class, 'index']);
});

// M E S S A G E S
Route::post('/{username}/messages', [MessageController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messages', [MessageController::class, 'index']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
});

// G I T H U B
Route::get('/github', [GitHubController::class, 'getStats']);
