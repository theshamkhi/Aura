<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Api extends Model
{
    protected $fillable = ['name', 'hashed_key', 'description', 'portfolio_id'];

    public function setHashedKeyAttribute($value)
    {
        $this->attributes['hashed_key'] = Hash::make($value);
    }

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }
}
