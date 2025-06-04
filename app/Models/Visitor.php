<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    protected $fillable = [
        'ip_address', 'user_agent', 'referrer', 'country', 
        'city', 'session_id', 'portfolio_id'
    ];

    public function messages() {
        return $this->hasMany(Message::class);
    }

    public function views() {
        return $this->hasMany(ProjectView::class);
    }
}
