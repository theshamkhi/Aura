<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Visitor;
use App\Models\ProjectView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProjectViewController extends Controller
{
    /**
     * Track a project view (Public endpoint)
     */
    public function trackView(Request $request, Project $project)
    {
        $validated = $request->validate(['session_id' => 'required|string|min:20|max:255']);
    
        try {
            $geoData = $this->getGeolocation($request->ip());
    
            $visitor = Visitor::firstOrCreate(
                ['session_id' => $validated['session_id']],
                [
                    'portfolio_id' => $project->portfolio_id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'referrer' => $request->header('referer'),
                    'country' => $geoData['country'],
                    'city' => $geoData['city']
                ]
            );
    
            ProjectView::create(['project_id' => $project->id, 'visitor_id' => $visitor->id]);
    
            return response()->json(['status' => 'success', 'view_count' => $project->views()->count()]);
    
        } catch (\Exception $e) {
            Log::error('View tracking failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Could not track view'], 500);
        }
    }

    /**
     * Get view statistics for a project (Public endpoint)
     */
    public function projectStats(Project $project)
    {
        $stats = [
            'total_views' => $project->views()->count(),
            'unique_visitors' => $project->views()->distinct('visitor_id')->count(),
            'views_timeline' => $project->views()
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'top_referrers' => Visitor::selectRaw('referrer, COUNT(*) as count')
                ->join('project_views', 'visitors.id', '=', 'project_views.visitor_id')
                ->where('project_views.project_id', $project->id)
                ->groupBy('referrer')
                ->orderByDesc('count')
                ->take(5)
                ->get(),
            'country_distribution' => Visitor::whereIn('id', 
                    $project->views()->select('visitor_id')
                )
                ->selectRaw('country, COUNT(*) as count')
                ->groupBy('country')
                ->orderByDesc('count')
                ->get()
        ];

        return response()->json([
            'status' => 'success',
            'stats' => $stats
        ]);
    }

    /**
     * Get cached geolocation data
     */
    private function getGeolocation(string $ip)
    {
        try {

            if (in_array($ip, ['127.0.0.1', '::1'])) {
                return [
                    'country' => 'Test Country',
                    'city' => 'Test City'
                ];
            }
        
            $response = Http::get('https://api.ipgeolocation.io/ipgeo', [
                'apiKey' => config('geoip.services.ipgeolocation.key'),
                'ip' => $ip
            ])->json();

        } catch (\Exception $e) {
            Log::warning("Geolocation failed for IP $ip: " . $e->getMessage());
            return ['country' => 'Unknown', 'city' => 'Unknown'];
        }
    
        return [
            'country' => $response['country_name'] ?? null,
            'city' => $response['city'] ?? null
        ];
    }

    /**
     * FOR Testing in Tinker
     */
    public function testGeoIP($ip)
    {
        return Http::get('https://api.ipgeolocation.io/ipgeo', [
            'apiKey' => config('geoip.services.ipgeolocation.key'),
            'ip' => $ip
        ])->json();
    }
}