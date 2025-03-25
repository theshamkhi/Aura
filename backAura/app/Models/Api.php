<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Api extends Model
{
    protected $fillable = ['apiName', 'apiKey', 'portfolio_id'];

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }
}
