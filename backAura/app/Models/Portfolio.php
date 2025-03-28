<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $fillable = ['title', 'image', 'owner_id'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function skills()
    {
        return $this->hasMany(Skill::class);
    }

    public function statistics()
    {
        return $this->hasOne(Statistic::class);
    }

    public function apis()
    {
        return $this->hasMany(Api::class);
    }
}
