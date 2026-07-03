<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Importance/knowledge sliders now move in 0.5 steps (1, 1.5, 2, ... 5)
     * instead of whole numbers — the integer columns can't hold that. Raw
     * SQL because ALTER COLUMN ... TYPE needs doctrine/dbal for
     * Schema::table()->change(), which isn't installed in this project.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN importance TYPE NUMERIC(3,1) USING importance::numeric(3,1)');
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN importance SET DEFAULT 3.0');
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN knowledge TYPE NUMERIC(3,1) USING knowledge::numeric(3,1)');
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN knowledge SET DEFAULT 3.0');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN importance TYPE SMALLINT USING round(importance)::smallint');
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN importance SET DEFAULT 3');
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN knowledge TYPE SMALLINT USING round(knowledge)::smallint');
        DB::statement('ALTER TABLE cycle_subject ALTER COLUMN knowledge SET DEFAULT 3');
    }
};
