<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Enforce one plan per cargo/course per user at the database level.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'course_id']);
        });
    }
};
