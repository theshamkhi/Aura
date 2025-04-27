<?php

namespace App\Http\Controllers;

use App\Services\GitHubService;

class GitHubController
{
    protected GitHubService $github;

    public function __construct(GitHubService $github)
    {
        $this->github = $github;
    }

    public function getStats()
    {
        try {
            $stats = $this->github->getBasicStats();
            
            return response()->json([
                'status' => 'success',
                'stats' => [
                    'commits' => $stats['total_commits'],
                    'repositories' => $stats['total_repos'],
                    'stars' => $stats['total_stars'],
                    'forks' => $stats['total_forks'],
                    'contributions' => $stats['total_contributions'],
                ],
                'charts' => $stats['charts']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch GitHub stats'
            ], 500);
        }
    }
}