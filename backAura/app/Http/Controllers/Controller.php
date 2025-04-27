<?php

namespace App\Http\Controllers;

use App\Models\User;

abstract class Controller
{
    /**
     * Find portfolio by username or fail
     */
    protected function findPortfolioByUsername($username)
    {
        $owner = User::where('username', $username)->firstOrFail();
        return $owner->portfolio;
    }
}
