<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-cycle configuration of each subject: difficulty perceived by the
        // student and preferred study format (steps 4 & 5 of the onboarding).
        Schema::create('cycle_subject', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('difficulty')->default('medio'); // facil | medio | dificil
            $table->string('format')->default('pdf');        // pdf | video
            $table->timestamps();

            $table->unique(['study_cycle_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_subject');
    }
};
