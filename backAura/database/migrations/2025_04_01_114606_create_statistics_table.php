<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->integer('total_visitors')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->json('most_viewed_projects')->nullable();
            $table->json('visitor_locations')->nullable();
            $table->foreignId('portfolio_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique('portfolio_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statistics');
    }
};
