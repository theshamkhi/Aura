<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\StatisticController;


// A U T H
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
});
// P O R T F O L I O
Route::apiResource('portfolios', PortfolioController::class);
Route::get('portfolios/{portfolio}/owner', [PortfolioController::class, 'owner']);
Route::get('portfolios/{portfolio}/projects', [PortfolioController::class, 'projects']);
Route::get('portfolios/{portfolio}/skills', [PortfolioController::class, 'skills']);
Route::get('portfolios/{portfolio}/achievements', [PortfolioController::class, 'achievements']);
Route::get('portfolios/{portfolio}/statistics', [PortfolioController::class, 'statistics']);
Route::get('portfolios/{portfolio}/apis', [PortfolioController::class, 'apis']);
// P R O J E C T S
Route::apiResource('projects', ProjectController::class);
Route::get('projects/category/{category}', [ProjectController::class, 'filterByCategory']);
Route::get('projects/technology/{skill}', [ProjectController::class, 'filterByTechnology']);
// S K I L L S
Route::apiResource('skills', SkillController::class);
Route::post('skills/{skill}/attach', [SkillController::class, 'attachToProject']);
Route::post('skills/{skill}/detach', [SkillController::class, 'detachFromProject']);
Route::get('skills/{skill}/projects', [SkillController::class, 'projects']);
// A C H I E V E M E N T S
Route::apiResource('achievements', AchievementController::class);
// S T A T I S T I C S
Route::post('statistics/track-visit', [StatisticController::class, 'trackVisit']);
Route::post('statistics/track-view', [StatisticController::class, 'trackProjectView']);
Route::get('portfolios/{portfolio}/statistics', [StatisticController::class, 'show']);
Route::get('portfolios/{portfolio}/statistics/trends', [StatisticController::class, 'visitorTrends']);
Route::get('portfolios/{portfolio}/statistics/top-projects', [StatisticController::class, 'topProjects']);
Route::post('portfolios/{portfolio}/statistics/reset', [StatisticController::class, 'reset']);