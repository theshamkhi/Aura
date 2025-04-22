<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Visitor;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\NewMessageNotification;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MessageController extends Controller
{
    /**
     * Public: Submit new message
     */
    public function store(Request $request, Portfolio $portfolio)
    {
        $validated = $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'nullable|email|max:255',
            'message' => 'required|string|max:2000',
            'session_id' => 'required|string|exists:visitors,session_id'
        ]);
    
        try {
            $visitor = Visitor::where('session_id', $validated['session_id'])
                ->where('portfolio_id', $portfolio->id)
                ->firstOrFail();
    
            $message = $visitor->messages()->create([
                'sender_name' => $validated['sender_name'],
                'sender_email' => $validated['sender_email'],
                'message' => $validated['message'],
                'portfolio_id' => $portfolio->id
            ]);
    
            if ($message->sender_email) {
                Mail::to($portfolio->owner->email)->send(new NewMessageNotification($message));
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully'
            ]);
    
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid session. Please reload the page.'
            ], 400);
        }
    }

    /**
     * Authenticated: List messages
     */
    public function index()
    {
        $messages = Auth::user()->portfolio->messages()
            ->with('visitor')
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'messages' => $messages->map(function($message) {
                return [
                    'id' => $message->id,
                    'sender_name' => $message->sender_name,
                    'sender_email' => $message->sender_email,
                    'message' => $message->message,
                    'received_at' => $message->created_at,
                    'visitor' => $message->visitor?->only(['country', 'city']),
                ];
            }),
            'pagination' => [
                'total' => $messages->total(),
                'current_page' => $messages->currentPage()
            ]
        ]);
    }

    /**
     * Authenticated: Delete message
     */
    public function destroy(Message $message)
    {
        if (Auth::user()->portfolio->id !== $message->portfolio_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $message->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Message deleted successfully'
        ]);
    }
}