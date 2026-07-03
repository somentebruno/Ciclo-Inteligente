<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * How a logged session was studied — a cursinho aula (with a real
     * lesson attached), a PDF, or something else — kept separate from
     * `topic_id` (the edital item), since the two no longer map 1:1.
     */
    public function up(): void
    {
        Schema::table('study_sessions', function (Blueprint $table) {
            $table->string('source')->nullable()->after('topic_id'); // aula | pdf | outro
            $table->foreignId('aula_id')->nullable()->after('source')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('study_sessions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('aula_id');
            $table->dropColumn('source');
        });
    }
};
