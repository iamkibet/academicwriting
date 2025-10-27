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
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('points')->default(0);
            $table->integer('total_points_earned')->default(0);
            $table->integer('total_points_redeemed')->default(0);
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('reward_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['earned', 'redeemed', 'expired']);
            $table->integer('points');
            $table->string('description');
            $table->string('source_type')->nullable(); // order, referral, bonus, etc.
            $table->foreignId('source_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_transactions');
        Schema::dropIfExists('rewards');
    }
};
