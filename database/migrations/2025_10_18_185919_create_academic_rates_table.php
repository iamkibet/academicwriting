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
        Schema::create('academic_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_level_id')->constrained()->cascadeOnDelete();
            $table->integer('hours');
            $table->string('label');
            $table->decimal('cost', 10, 2);
            $table->boolean('deleted')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_rates');
    }
};
