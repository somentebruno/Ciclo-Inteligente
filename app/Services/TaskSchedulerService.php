<?php

namespace App\Services;

use App\Models\StudyCycle;
use App\Models\StudyTask;
use Illuminate\Support\Carbon;

/**
 * Turns a study cycle into a concrete queue of scheduled tasks (StudyTask) for
 * the coming days: theory tasks for lessons not yet studied, plus review tasks
 * for lessons the student marked as already studied.
 */
class TaskSchedulerService
{
    private const HORIZON_DAYS = 7;

    private const DIFFICULTY_WEIGHT = [
        'facil' => 1,
        'medio' => 2,
        'dificil' => 3,
    ];

    public function schedule(StudyCycle $cycle): void
    {
        $cycle->loadMissing(['configuredSubjects.topics', 'studiedTopics']);

        // Regenerate only the pending queue; keep completed history intact.
        StudyTask::query()
            ->where('study_cycle_id', $cycle->id)
            ->where('status', 'pending')
            ->delete();

        $studiedIds = $cycle->studiedTopics->pluck('id')->all();
        $perDay = $cycle->daily_tasks ?: max(1, (int) ceil(($cycle->weekly_tasks ?: 7) / 7));
        $maxTheory = $perDay * self::HORIZON_DAYS;
        $today = Carbon::today();

        // Hardest subjects first.
        $subjects = $cycle->configuredSubjects
            ->sortByDesc(fn ($s) => self::DIFFICULTY_WEIGHT[$s->pivot->difficulty] ?? 2)
            ->values();

        // Per-subject queues of not-yet-studied topics, in order.
        $queues = $subjects->map(fn ($subject) => [
            'subject' => $subject,
            'topics' => $subject->topics
                ->whereNotIn('id', $studiedIds)
                ->sortBy('order')
                ->values(),
        ]);

        // Round-robin interleave so each day mixes disciplines.
        $theory = [];
        $maxLen = $queues->max(fn ($q) => $q['topics']->count()) ?? 0;
        for ($i = 0; $i < $maxLen; $i++) {
            foreach ($queues as $queue) {
                if ($topic = $queue['topics']->get($i)) {
                    $theory[] = ['subject' => $queue['subject'], 'topic' => $topic];
                }
            }
        }
        $theory = array_slice($theory, 0, $maxTheory);

        foreach ($theory as $index => $item) {
            StudyTask::create([
                'user_id' => $cycle->user_id,
                'study_cycle_id' => $cycle->id,
                'subject_id' => $item['subject']->id,
                'topic_id' => $item['topic']->id,
                'title' => $item['topic']->name,
                'type' => StudyTask::TYPE_THEORY,
                'format' => $item['subject']->pivot->format ?? 'pdf',
                'planned_minutes' => CycleGeneratorService::MINUTES_PER_TASK,
                'scheduled_for' => $today->copy()->addDays(intdiv($index, $perDay)),
                'position' => $index,
                'status' => 'pending',
            ]);
        }

        // Review tasks for already-studied lessons, spread over the horizon.
        foreach ($cycle->studiedTopics->values() as $i => $topic) {
            $subject = $subjects->firstWhere('id', $topic->subject_id);

            StudyTask::create([
                'user_id' => $cycle->user_id,
                'study_cycle_id' => $cycle->id,
                'subject_id' => $topic->subject_id,
                'topic_id' => $topic->id,
                'title' => $topic->name,
                'type' => StudyTask::TYPE_REVIEW,
                'format' => $subject?->pivot->format ?? 'pdf',
                'planned_minutes' => 45,
                'scheduled_for' => $today->copy()->addDays($i % self::HORIZON_DAYS),
                'position' => $i,
                'status' => 'pending',
            ]);
        }
    }
}
