<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = ['title', 'description', 'image_url', 'date', 'portfolio_id'];

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }
}
