<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ProjectViewController;
use App\Http\Controllers\VisitorController;


// A U T H
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
// P O R T F O L I O
Route::get('/portfolios/{portfolio}', [PortfolioController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/portfolio', [PortfolioController::class, 'update']);
    Route::post('/portfolio/owner', [PortfolioController::class, 'updateOwner']);
    Route::delete('/portfolio', [PortfolioController::class, 'destroy']);
});
// P R O J E C T S  &  V I E W S
Route::get('/portfolio/{portfolio}/projects', [ProjectController::class, 'index']);
Route::get('/portfolio/{portfolio}/projects/{project}', [ProjectController::class, 'show']);
Route::get('/portfolio/{portfolio}/projects/technology/{skill}', [ProjectController::class, 'filterByTechnology']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
});
Route::post('/projects/{project}/views', [ProjectViewController::class, 'trackView']);
Route::get('/projects/{project}/stats', [ProjectViewController::class, 'projectStats']);
// S K I L L S
Route::get('/portfolios/{portfolio}/skills', [SkillController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/skills', [SkillController::class, 'store']);
    Route::put('/skills/{skill}', [SkillController::class, 'update']);
    Route::post('/skills/{skill}/attach', [SkillController::class, 'attachToProject']);
    Route::post('/skills/{skill}/detach', [SkillController::class, 'detachFromProject']);
    Route::delete('/skills/{skill}', [SkillController::class, 'destroy']);
});
// A C H I E V E M E N T S
Route::apiResource('achievements', AchievementController::class);
// V I S I T O R S
Route::post('/portfolios/{portfolio}/visitors/track', [VisitorController::class, 'track']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/portfolios/{portfolio}/visitors', [VisitorController::class, 'index']);
});
// // S T A T I S T I C S