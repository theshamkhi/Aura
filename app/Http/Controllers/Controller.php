<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;

abstract class Controller
{
    /**
     * Get the single portfolio instance
     * Since this is now a personal portfolio system, there should only be one portfolio
     */
    protected function getPortfolio()
    {
        return Portfolio::with('owner')->firstOrFail();
    }
}