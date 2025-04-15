<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title', 'description', 'image_url', 'category', 'date',
        'source_code_url', 'live_site_url', 'portfolio_id'
    ];

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }

    public function technologies() {
        return $this->belongsToMany(Skill::class, 'project_technologies');
    }

    public function views() {
        return $this->hasMany(ProjectView::class);
    }
}
