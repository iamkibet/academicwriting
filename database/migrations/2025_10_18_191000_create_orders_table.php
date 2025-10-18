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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->foreignId('academic_level_id')->constrained('academic_levels')->cascadeOnDelete();
            $table->foreignId('service_type_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('deadline_type_id')->constrained('order_rates')->cascadeOnDelete();
            $table->foreignId('language_id')->constrained('languages')->cascadeOnDelete();
            $table->datetime('deadline_date');
            $table->integer('pages');
            $table->integer('words');
            $table->decimal('price', 10, 2);
            $table->enum('status', [
                'placed', 'active', 'assigned', 'in_progress', 
                'submitted', 'waiting_for_review', 'completed', 
                'cancelled', 'in_revision'
            ])->default('placed');
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('writer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            $table->text('client_notes')->nullable();
            $table->string('requirements_file')->nullable();
            $table->string('submitted_file')->nullable();
            $table->string('final_file')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['client_id', 'status']);
            $table->index(['academic_level_id', 'service_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
