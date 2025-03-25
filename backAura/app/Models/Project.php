<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title', 'description', 'image', 'category',
        'date', 'sourceCodeLink', 'liveSiteLink', 'portfolio_id'
    ];

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'project_technologies');
    }
}
