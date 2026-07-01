<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A scheduled unit of work in the study queue: one lesson (topic) to
        // study or review, derived from the plan during onboarding.
        Schema::create('study_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('study_cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('type')->default('theory');   // theory | review
            $table->string('format')->default('pdf');     // pdf | video
            $table->unsignedSmallInteger('planned_minutes')->default(90);
            $table->date('scheduled_for');
            $table->unsignedSmallInteger('position')->default(0);
            $table->string('status')->default('pending'); // pending | done
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'scheduled_for']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_tasks');
    }
};
