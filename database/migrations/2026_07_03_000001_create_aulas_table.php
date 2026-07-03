<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aulas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('minutes')->default(30);
            $table->timestamps();

            $table->index(['subject_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aulas');
    }
};
