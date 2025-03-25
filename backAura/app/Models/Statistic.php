<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statistic extends Model
{
    protected $fillable = ['totalVisitors'];

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }
}
