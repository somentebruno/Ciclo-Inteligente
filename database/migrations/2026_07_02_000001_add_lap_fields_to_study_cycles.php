<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cycle-methodology lap tracking: how many full laps of the cycle the
     * student completed, and when the current lap started (progress is measured
     * from this timestamp).
     */
    public function up(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->unsignedInteger('completed_laps')->default(0)->after('weekly_tasks');
            $table->timestamp('lap_started_at')->nullable()->after('completed_laps');
        });
    }

    public function down(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->dropColumn(['completed_laps', 'lap_started_at']);
        });
    }
};
