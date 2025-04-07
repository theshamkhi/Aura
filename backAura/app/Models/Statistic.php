<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statistic extends Model
{
    protected $fillable = [
        'total_visitors', 'unique_visitors', 'portfolio_id'
    ];

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }
}
