<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            // Availability chosen during onboarding (1 tarefa ≈ 1h30 de estudo).
            $table->unsignedSmallInteger('daily_tasks')->nullable()->after('weekly_hours');
            $table->unsignedSmallInteger('weekly_tasks')->nullable()->after('daily_tasks');
            $table->timestamp('onboarding_completed_at')->nullable()->after('generated_at');
        });
    }

    public function down(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->dropColumn(['daily_tasks', 'weekly_tasks', 'onboarding_completed_at']);
        });
    }
};
