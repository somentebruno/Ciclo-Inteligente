<?php

namespace App\Services;

use App\Models\StudyCycle;
use App\Models\StudyCycleItem;

/**
 * Turns a student's onboarding choices into a concrete study cycle: the
 * repeating "molde" of small, session-sized blocks (StudyCycleItem) that
 * make up one lap — interleaved round-robin across subjects (classic
 * "ciclo de estudos" rotation), with harder subjects getting more reps.
 * This is the "montagem do plano" logic.
 */
class CycleGeneratorService
{
    /** How much study time a single task represents, in minutes (1 tarefa ≈ 1h30). */
    public const MINUTES_PER_TASK = 90;

    /**
     * Weight of a subject given the student's self-rated importance (1-5) and
     * knowledge (1-5): more important + less known = more study time.
     */
    public static function weight(int $importance, int $knowledge): int
    {
        return $importance * (6 - $knowledge);
    }

    /**
     * How long a single task/session should be: the midpoint of the
     * student's chosen min/max session duration (from the "Criar
     * Planejamento" modal), falling back to the generic estimate when
     * they weren't set.
     */
    public static function sessionMinutes(?int $min, ?int $max): int
    {
        if ($min && $max) {
            return (int) round(($min + $max) / 2);
        }

        return self::MINUTES_PER_TASK;
    }

    /**
     * Generate (or regenerate) the cycle items for a given cycle.
     *
     * @param  array<int, array{subject_id:int, importance:int, knowledge:int, format:string}>  $subjects
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
            fn (array $s) => self::weight($s['importance'], $s['knowledge']),
            $subjects
        ));

        // Heavier subjects first, so the rotation front-loads them.
        usort($subjects, fn (array $a, array $b) => self::weight($b['importance'], $b['knowledge'])
            <=> self::weight($a['importance'], $a['knowledge']));

        $sessionMinutes = self::sessionMinutes($cycle->min_session_minutes, $cycle->max_session_minutes);

        // How many blocks each subject gets this lap, proportional to its
        // weight — guaranteeing at least one block per subject.
        $queues = array_map(fn (array $s) => [
            'subject_id' => $s['subject_id'],
            'remaining' => max(1, (int) round(self::weight($s['importance'], $s['knowledge']) / $totalWeight * $weeklyTasks)),
        ], $subjects);

        // Round-robin: one block per subject per pass, repeating until every
        // subject's quota for this lap is used up — the actual small,
        // repeating "ciclo de estudos" rotation, not one lump sum per subject.
        $position = 1;
        $anyLeft = true;
        while ($anyLeft) {
            $anyLeft = false;
            foreach ($queues as &$queue) {
                if ($queue['remaining'] <= 0) {
                    continue;
                }

                StudyCycleItem::create([
                    'study_cycle_id' => $cycle->id,
                    'subject_id' => $queue['subject_id'],
                    'position' => $position++,
                    'planned_minutes' => $sessionMinutes,
                    'completed_minutes' => 0,
                    'is_done' => false,
                ]);

                $queue['remaining']--;
                $anyLeft = $anyLeft || $queue['remaining'] > 0;
            }
            unset($queue);
        }
    }
}
