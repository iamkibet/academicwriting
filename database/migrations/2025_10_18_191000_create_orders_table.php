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
            $table->string('paper_type')->nullable(); // Type of paper (e.g., Essay, Research Paper, etc.)
            $table->foreignId('discipline_id')->constrained('subjects')->cascadeOnDelete(); // Discipline (e.g., Mathematics, Science, etc.)
            $table->foreignId('service_type_id')->constrained('subjects')->cascadeOnDelete(); // Service type (same as discipline for now)
            $table->integer('deadline_hours');
            $table->foreignId('language_id')->constrained('languages')->cascadeOnDelete();
            $table->datetime('deadline_date');
            $table->integer('pages');
            $table->integer('words');
            $table->enum('spacing', ['single', 'double'])->default('double');
            $table->string('paper_format')->default('APA'); // Paper format (APA, MLA, etc.)
            $table->integer('number_of_sources')->default(2); // Number of sources required
            $table->decimal('price', 10, 2);
            $table->json('additional_features')->nullable(); // Store selected additional features as JSON
            $table->enum('status', [
                'waiting_for_payment', 'writer_pending', 'in_progress', 
                'review', 'approval', 'cancelled', 'in_revision'
            ])->default('waiting_for_payment');
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
