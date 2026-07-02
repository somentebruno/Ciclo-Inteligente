<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudyCycle;
use App\Models\StudySession;
use App\Models\StudyTask;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Landing screen with the greeting and today's focus bar.
     */
    public function index(Request $request): Response
    {
        $user = $this->currentUser($request);
        $today = Carbon::today();

        $plan = $this->activePlan($request);
        $planId = $plan?->id;

        $todayTasks = StudyTask::query()
            ->where('user_id', $user->id)
            ->when($planId, fn ($q) => $q->where('study_cycle_id', $planId))
            ->whereDate('scheduled_for', $today)
            ->get(['id', 'status']);

        $goal = $todayTasks->count();
        $completed = $todayTasks->where('status', 'done')->count();

        return Inertia::render('Home', [
            'focus' => [
                'goal' => $goal,
                'completed' => $completed,
                'done' => $goal > 0 && $completed >= $goal,
            ],
            'nextTask' => $this->nextTask($user->id, $planId),
            'weekly' => $this->weeklyProgress($user->id, $plan),
            'week' => $this->weekOverview($user->id, $planId, $today),
            'stats' => $planId ? $this->quadrantStats($user->id, $planId) : null,
        ]);
    }

    /**
     * The 2×2 stats quadrant beside "Minha semana": hours studied this week,
     * overall accuracy, current streak and tasks completed this week.
     *
     * @return array<string, mixed>
     */
    private function quadrantStats(int $userId, int $planId): array
    {
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        $sessions = fn () => StudySession::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId);

        $minutesWeek = (int) $sessions()
            ->whereBetween('studied_at', [$weekStart, $weekEnd])
            ->sum('duration_minutes');

        $totals = $sessions()
            ->selectRaw('COALESCE(SUM(questions_total), 0) as qt, COALESCE(SUM(questions_correct), 0) as qc')
            ->first();
        $accuracy = $totals && $totals->qt > 0
            ? (int) round($totals->qc / $totals->qt * 100)
            : null;

        $completedWeek = StudyTask::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId)
            ->where('status', 'done')
            ->whereBetween('completed_at', [$weekStart, $weekEnd])
            ->count();

        return [
            'minutes_week' => $minutesWeek,
            'accuracy' => $accuracy,
            'streak' => $this->studyStreak($userId),
            'completed_week' => $completedWeek,
        ];
    }

    /**
     * "Minha semana" — the next 7 days with task counts and completion, for the
     * mini day-cards on the Home.
     *
     * @return array<int, array<string, mixed>>|null
     */
    private function weekOverview(int $userId, ?int $planId, Carbon $today): ?array
    {
        if (! $planId) {
            return null;
        }

        $tasks = StudyTask::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId)
            ->whereBetween('scheduled_for', [
                $today->toDateString(),
                $today->copy()->addDays(6)->toDateString(),
            ])
            ->get(['id', 'status', 'scheduled_for']);

        return collect(range(0, 6))->map(function (int $offset) use ($today, $tasks) {
            $date = $today->copy()->addDays($offset);
            $dayTasks = $tasks->filter(fn ($t) => $t->scheduled_for->isSameDay($date));

            return [
                'weekday' => $offset === 0
                    ? 'Hoje'
                    : ucfirst(rtrim($date->isoFormat('ddd'), '.')),
                'is_today' => $offset === 0,
                'total' => $dayTasks->count(),
                'done' => $dayTasks->where('status', 'done')->count(),
            ];
        })->all();
    }

    /**
     * "Progresso desta semana" — tasks completed this week against the plan's
     * weekly goal, the current rhythm, and the study streak.
     *
     * @return array<string, mixed>|null
     */
    private function weeklyProgress(int $userId, ?StudyCycle $plan): ?array
    {
        if (! $plan) {
            return null;
        }

        $goal = max(1, (int) ($plan->weekly_tasks ?: 7));
        $idealPerDay = max(1, (int) ($plan->daily_tasks ?: (int) ceil($goal / 7)));

        $done = StudyTask::query()
            ->where('study_cycle_id', $plan->id)
            ->where('status', 'done')
            ->whereBetween('completed_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek(),
            ])
            ->count();

        // Rhythm relative to the ideal pace up to today (Mon=1 .. Sun=7).
        $expected = min($goal, $idealPerDay * Carbon::now()->dayOfWeekIso);
        if ($done >= $expected || $done >= $goal) {
            $rhythm = 'great';
        } elseif ($done >= $expected * 0.5) {
            $rhythm = 'ok';
        } else {
            $rhythm = 'behind';
        }

        return [
            'goal' => $goal,
            'done' => $done,
            'remaining' => max(0, $goal - $done),
            'ideal_per_day' => $idealPerDay,
            'rhythm' => $rhythm,
            'streak' => $this->studyStreak($userId),
        ];
    }

    /**
     * Number of consecutive days (ending today, or yesterday as grace) with at
     * least one logged study session.
     */
    private function studyStreak(int $userId): int
    {
        $dates = StudySession::query()
            ->where('user_id', $userId)
            ->pluck('studied_at')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->flip();

        if ($dates->isEmpty()) {
            return 0;
        }

        $cursor = Carbon::today();

        // If nothing was logged today but yesterday was, the streak still stands.
        if (! $dates->has($cursor->toDateString())
            && $dates->has($cursor->copy()->subDay()->toDateString())) {
            $cursor = $cursor->subDay();
        }

        $streak = 0;
        while ($dates->has($cursor->toDateString())) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    /**
     * The next pending task in the active plan, with the progress context shown
     * on the "Próxima tarefa" card.
     *
     * @return array<string, mixed>|null
     */
    private function nextTask(int $userId, ?int $planId): ?array
    {
        if (! $planId) {
            return null;
        }

        $next = StudyTask::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId)
            ->where('status', 'pending')
            ->with('subject:id,name,color')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->first();

        if (! $next) {
            return null;
        }

        // Progress within the task's discipline (ordered lesson sequence).
        $subjectTasks = StudyTask::query()
            ->where('study_cycle_id', $planId)
            ->where('subject_id', $next->subject_id)
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->get(['id', 'status']);

        $subjectDone = $subjectTasks->where('status', 'done')->count();
        $lessonIndex = $subjectTasks->search(fn ($t) => $t->id === $next->id);
        $lessonNumber = $lessonIndex === false ? $subjectDone + 1 : $lessonIndex + 1;

        // Position of this task within the tasks scheduled for its own day.
        $dayTaskIds = StudyTask::query()
            ->where('study_cycle_id', $planId)
            ->whereDate('scheduled_for', $next->scheduled_for)
            ->orderBy('position')
            ->pluck('id');
        $dayIndex = $dayTaskIds->search($next->id);

        return [
            'id' => $next->id,
            'title' => $next->title,
            'type' => $next->type,
            'format' => $next->format,
            'planned_minutes' => $next->planned_minutes,
            'lesson_number' => $lessonNumber,
            'subject' => $next->subject?->only('id', 'name', 'color'),
            'subject_done' => $subjectDone,
            'subject_total' => $subjectTasks->count(),
            'day_current' => $dayIndex === false ? 1 : $dayIndex + 1,
            'day_total' => $dayTaskIds->count(),
        ];
    }
}
