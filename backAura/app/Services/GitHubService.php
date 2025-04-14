<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class GitHubService
{
    protected string $token;
    protected string $username;

    public function __construct()
    {
        $this->token = config('services.github.token');
        $this->username = config('services.github.username');
    }

    public function getBasicStats(): array
    {
        return Cache::remember('github_stats', 3600, function () {
            $repos = $this->getRepositories();
            
            $totalStars = array_sum(array_column($repos, 'stargazers_count'));
            $totalForks = array_sum(array_column($repos, 'forks_count'));
            $totalCommits = $this->calculateTotalCommits($repos);

            return [
                'username' => $this->username,
                'total_repos' => count($repos),
                'total_stars' => $totalStars,
                'total_forks' => $totalForks,
                'total_commits' => $totalCommits,
                'total_contributions' => $this->getContributionsCount(),
                'charts' => $this->getChartUrls()
            ];
        });
    }

    private function getRepositories(): array
    {
        return Http::withToken($this->token)
            ->get("https://api.github.com/users/{$this->username}/repos?per_page=100")
            ->json();
    }

    private function calculateTotalCommits(array $repos): int
    {
        return array_sum(array_map(function ($repo) {
            return Http::withToken($this->token)
                ->get("https://api.github.com/repos/{$this->username}/{$repo['name']}/contributors")
                ->json()[0]['contributions'] ?? 0;
        }, $repos));
    }

    private function getChartUrls(): array
    {
        return [
            'contributions' => "https://ghchart.rshah.org/{$this->username}",
            'stats' => "https://github-readme-stats.vercel.app/api?username={$this->username}&show_icons=true",
            'languages' => "https://github-readme-stats.vercel.app/api/top-langs/".
                           "?username={$this->username}&layout=compact&hide=blade,shell",
            'streak' => "https://github-readme-streak-stats.herokuapp.com/".
                        "?user={$this->username}&date_format=M%20j%5B%2C%20Y%5D"
        ];
    }

    private function getContributionsCount(): int
    {
        $query = <<<'GRAPHQL'
        query($userName:String!) { 
            user(login: $userName) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                    }
                }
            }
        }
        GRAPHQL;

        $response = Http::withToken($this->token)
            ->post('https://api.github.com/graphql', [
                'query' => $query,
                'variables' => ['userName' => $this->username]
            ])->json();

        return $response['data']['user']['contributionsCollection']['contributionCalendar']['totalContributions'] ?? 0;
    }
}