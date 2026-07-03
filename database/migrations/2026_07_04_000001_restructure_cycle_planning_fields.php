<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replaces the 3-level "difficulty" pick with two student-chosen sliders
     * (importance, knowledge) that drive the cycle's per-subject weight, and
     * adds the "when/how long" settings collected on the new plan-creation
     * modal (which days to study, min/max session length).
     */
    public function up(): void
    {
        Schema::table('cycle_subject', function (Blueprint $table) {
            $table->dropColumn('difficulty');
            $table->unsignedTinyInteger('importance')->default(3)->after('subject_id');
            $table->unsignedTinyInteger('knowledge')->default(3)->after('importance');
        });

        Schema::table('study_cycles', function (Blueprint $table) {
            $table->json('study_days')->nullable()->after('weekly_hours'); // 0=Domingo..6=Sabado
            $table->unsignedInteger('min_session_minutes')->nullable()->after('study_days');
            $table->unsignedInteger('max_session_minutes')->nullable()->after('min_session_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('cycle_subject', function (Blueprint $table) {
            $table->dropColumn(['importance', 'knowledge']);
            $table->string('difficulty')->default('medio');
        });

        Schema::table('study_cycles', function (Blueprint $table) {
            $table->dropColumn(['study_days', 'min_session_minutes', 'max_session_minutes']);
        });
    }
};
