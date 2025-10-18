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
        Schema::create('pricing_presets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('academic_level', ['high_school', 'college', 'graduate', 'phd']);
            $table->enum('service_type', ['essay', 'research_paper', 'thesis', 'dissertation']);
            $table->enum('deadline_type', ['standard', 'rush', 'ultra_rush']);
            $table->decimal('base_price_per_page', 8, 2);
            $table->decimal('multiplier', 3, 2)->default(1.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['academic_level', 'service_type', 'deadline_type']);
            $table->index(['is_active', 'academic_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_presets');
    }
};
