<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Study-material links a student attaches to a topic (e.g. a video class,
     * an article) from the edital verticalizado checklist.
     */
    public function up(): void
    {
        Schema::create('topic_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('url', 2048);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['topic_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topic_links');
    }
};
