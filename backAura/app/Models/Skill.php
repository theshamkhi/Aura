<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['name', 'icon', 'portfolio_id'];

    public function projects() {
        return $this->belongsToMany(Project::class, 'project_technologies');
    }
    
    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }
}
