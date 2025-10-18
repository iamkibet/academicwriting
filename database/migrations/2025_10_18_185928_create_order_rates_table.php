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
        Schema::create('order_rates', function (Blueprint $table) {
            $table->id();
            $table->integer('hours');
            $table->string('label');
            $table->decimal('high_school', 10, 2);
            $table->decimal('under_graduate', 10, 2);
            $table->decimal('masters', 10, 2);
            $table->decimal('phd', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_rates');
    }
};
