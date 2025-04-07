<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectView extends Model
{
    protected $fillable = ['project_id', 'visitor_id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }
}