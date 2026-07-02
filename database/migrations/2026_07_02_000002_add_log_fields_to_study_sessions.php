<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Structured fields for the "Registro de Estudo" / "Últimos Estudos" flow,
     * kept separate from `notes` (free-form comments only).
     */
    public function up(): void
    {
        Schema::table('study_sessions', function (Blueprint $table) {
            $table->string('category')->nullable()->after('study_cycle_item_id');
            $table->string('material')->nullable()->after('category');
            $table->unsignedInteger('pages_read')->nullable()->after('material');
            // Decouples "which subject this belongs to" (study_cycle_item_id,
            // always set when known) from "does it count toward the cycle's
            // progress bars" (this flag), so unchecking "contabilizar no
            // planejamento" doesn't orphan the session from its subject.
            $table->boolean('counts_in_plan')->default(true)->after('pages_read');
        });
    }

    public function down(): void
    {
        Schema::table('study_sessions', function (Blueprint $table) {
            $table->dropColumn(['category', 'material', 'pages_read', 'counts_in_plan']);
        });
    }
};
