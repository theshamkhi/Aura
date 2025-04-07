<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = ['title', 'description', 'image_url', 'portfolio_id'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }
}
