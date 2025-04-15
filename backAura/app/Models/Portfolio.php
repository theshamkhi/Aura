<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $fillable = ['title', 'image', 'owner_id'];
    

    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function projects() {
        return $this->hasMany(Project::class);
    }

    public function visitors() {
        return $this->hasMany(Visitor::class);
    }

    public function messages() {
        return $this->hasMany(Message::class);
    }

    public function achievements() {
        return $this->hasMany(Achievement::class);
    }

    public function skills() {
        return $this->hasMany(Skill::class);
    }
}
