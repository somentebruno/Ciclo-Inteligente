<?php

namespace App\Services;

use App\Models\StudyCycle;
use App\Models\StudyCycleItem;

/**
 * Turns a student's onboarding choices into a concrete study cycle: a set of
 * ordered blocks (StudyCycleItem) where harder subjects get proportionally more
 * study time. This is the "montagem do plano" logic.
 */
class CycleGeneratorService
{
    /** How much study time a single task represents, in minutes (1 tarefa ≈ 1h30). */
    public const MINUTES_PER_TASK = 90;

    /** Relative weight of each perceived difficulty. */
    private const DIFFICULTY_WEIGHT = [
        'facil' => 1,
        'medio' => 2,
        'dificil' => 3,
    ];

    /**
     * Generate (or regenerate) the cycle items for a given cycle.
     *
     * @param  array<int, array{subject_id:int, difficulty:string, format:string}>  $subjects
     */
    public function generate(StudyCycle $cycle, array $subjects): void
    {
        // Start fresh so regenerating the plan is idempotent.
        $cycle->items()->delete();

        if (empty($subjects)) {
            return;
        }

        $weeklyTasks = max(1, (int) ($cycle->weekly_tasks ?? 7));

        $totalWeight = array_sum(array_map(
            fn (array $s) => self::DIFFICULTY_WEIGHT[$s['difficulty']] ?? 2,
            $subjects
        ));

        // Harder subjects first, so the rotation front-loads the heavy topics.
        usort($subjects, fn (array $a, array $b) => (self::DIFFICULTY_WEIGHT[$b['difficulty']] ?? 2)
            <=> (self::DIFFICULTY_WEIGHT[$a['difficulty']] ?? 2));

        $position = 1;

        foreach ($subjects as $subject) {
            $weight = self::DIFFICULTY_WEIGHT[$subject['difficulty']] ?? 2;

            // Distribute the weekly tasks proportionally to the difficulty weight,
            // guaranteeing at least one task per subject.
            $tasks = max(1, (int) round($weight / $totalWeight * $weeklyTasks));

            StudyCycleItem::create([
                'study_cycle_id' => $cycle->id,
                'subject_id' => $subject['subject_id'],
                'position' => $position++,
                'planned_minutes' => $tasks * self::MINUTES_PER_TASK,
                'completed_minutes' => 0,
                'is_done' => false,
            ]);
        }
    }
}
