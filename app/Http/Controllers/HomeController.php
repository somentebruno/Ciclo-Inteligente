<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
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

        $planId = $this->activePlan($request)?->id;

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
        ]);
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
