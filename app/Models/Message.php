<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_name', 'sender_email', 'message', 
        'portfolio_id', 'visitor_id'
    ];

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }

    public function visitor() {
        return $this->belongsTo(Visitor::class);
    }
}
