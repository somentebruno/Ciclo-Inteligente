<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_cycle_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position');           // ordem na rotação do ciclo
            $table->unsignedSmallInteger('planned_minutes');    // duração planejada do bloco
            $table->unsignedSmallInteger('completed_minutes')->default(0);
            $table->boolean('is_done')->default(false);
            $table->timestamps();

            $table->unique(['study_cycle_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_cycle_items');
    }
};
