<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // "Já estudei" (step 6): topics the student already mastered. These are
        // removed from the theoretical study queue and get "smart reviews"
        // instead of fixed-date reviews.
        Schema::create('cycle_topic', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->boolean('already_studied')->default(true);
            $table->timestamps();

            $table->unique(['study_cycle_id', 'topic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_topic');
    }
};
