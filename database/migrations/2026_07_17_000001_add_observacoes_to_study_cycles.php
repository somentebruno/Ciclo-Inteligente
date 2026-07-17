<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->text('observacoes')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('study_cycles', function (Blueprint $table) {
            $table->dropColumn('observacoes');
        });
    }
};
