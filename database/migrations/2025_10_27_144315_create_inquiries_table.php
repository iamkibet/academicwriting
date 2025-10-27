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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('academic_level_id')->nullable()->constrained()->nullOnDelete();
            $table->string('paper_type')->nullable();
            $table->foreignId('discipline_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('service_type_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->integer('deadline_hours')->nullable();
            $table->foreignId('language_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('deadline_date')->nullable();
            $table->integer('pages')->default(1);
            $table->integer('words')->default(250);
            $table->string('spacing')->default('double'); // single or double
            $table->string('paper_format')->nullable();
            $table->integer('number_of_sources')->default(0);
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->json('additional_features')->nullable();
            $table->text('client_notes')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, converted
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->foreignId('converted_to_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index('status');
            $table->index('converted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
