<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedTinyInteger('weight')->default(1);      // peso no ciclo (1-10)
            $table->unsignedTinyInteger('difficulty')->default(3);  // dificuldade percebida (1-5)
            $table->string('color', 7)->nullable();                 // cor hex para a UI
            $table->timestamps();

            $table->unique(['course_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
