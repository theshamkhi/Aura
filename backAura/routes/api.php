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
});
// P O R T F O L I O
Route::get('/portfolio', [PortfolioController::class, 'show']);
Route::put('/portfolio', [PortfolioController::class, 'update']);
Route::get('/portfolio/owner', [PortfolioController::class, 'owner']);
Route::post('/portfolio/owner', [PortfolioController::class, 'updateOwner']);
// P R O J E C T S
Route::apiResource('projects', ProjectController::class);
Route::get('projects/category/{category}', [ProjectController::class, 'filterByCategory']);
Route::get('projects/technology/{skill}', [ProjectController::class, 'filterByTechnology']);
Route::post('projects/{project}/views', [ProjectController::class, 'incrementViews']);
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