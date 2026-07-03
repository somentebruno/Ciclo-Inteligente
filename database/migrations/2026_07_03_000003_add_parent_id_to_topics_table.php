<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A topic with subtopics becomes a grouping header, not itself a
     * studyable unit — only leaves (no subtopics) enter the task queue,
     * the study-log picker and the onboarding checklist.
     */
    public function up(): void
    {
        Schema::table('topics', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('subject_id')->constrained('topics')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('topics', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
        });
    }
};
