<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Some syllabi (e.g. IT specific knowledge) have long topic descriptions
        // that exceed the default VARCHAR(255).
        Schema::table('topics', function (Blueprint $table) {
            $table->text('name')->change();
        });
    }

    public function down(): void
    {
        Schema::table('topics', function (Blueprint $table) {
            $table->string('name')->change();
        });
    }
};
