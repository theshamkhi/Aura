<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class VisitorController extends Controller
{
    /**
     * Track visitor session for the personal portfolio
     */
    public function track(Request $request)
    {
        $portfolio = $this->getPortfolio();
        
        $validated = $request->validate([
            'session_id' => 'required|string|min:20|max:255'
        ]);

        try {
            $ip = $request->ip();
            $geoData = $this->getGeolocation($ip);

            $visitor = Visitor::firstOrCreate(
                ['session_id' => $validated['session_id']],
                [
                    'portfolio_id' => $portfolio->id,
                    'ip_address' => hash('sha256', $ip),
                    'user_agent' => $request->userAgent(),
                    'referrer' => $request->header('referer'),
                    'country' => $geoData['country'],
                    'city' => $geoData['city']
                ]
            );

            return response()->json([
                'status' => 'success',
                'visitor' => [
                    'id' => $visitor->id,
                    'country' => $visitor->country,
                    'city' => $visitor->city,
                    'referrer' => $visitor->referrer
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Tracking error: ' . $e->getMessage());
            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * List visitors with pagination
     */
    public function index()
    {
        $visitors = Auth::user()->portfolio->visitors()
            ->withCount(['messages', 'views'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'visitors' => $visitors->map(function($visitor) {
                return [
                    'id' => $visitor->id,
                    'country' => $visitor->country,
                    'city' => $visitor->city,
                    'referrer' => $visitor->referrer,
                    'messages_count' => $visitor->messages_count,
                    'views_count' => $visitor->views_count
                ];
            }),
            'pagination' => [
                'total' => $visitors->total(),
                'current_page' => $visitors->currentPage()
            ]
        ]);
    }

    /**
     * Geolocation helper (Reuse from ProjectViewController)
     */
    private function getGeolocation(string $ip)
    {
        if (app()->environment('local')) {
            return ['country' => 'Test Country', 'city' => 'Test City'];
        }

        try {
            $response = Http::get('https://api.ipgeolocation.io/ipgeo', [
                'apiKey' => config('services.ipgeolocation.key'),
                'ip' => $ip
            ])->json();

            return [
                'country' => $response['country_name'] ?? 'Unknown',
                'city' => $response['city'] ?? 'Unknown'
            ];
        } catch (\Exception $e) {
            Log::warning("Geolocation failed for IP $ip: " . $e->getMessage());
            return ['country' => 'Unknown', 'city' => 'Unknown'];
        }
    }
}