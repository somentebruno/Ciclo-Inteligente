<?php

namespace App\Http\Controllers;

use App\Models\StudySession;
use App\Models\StudyTask;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * The task queue: 7-day overview + tabbed lists.
     */
    public function index(Request $request): Response
    {
        $user = $this->currentUser($request);

        $tasks = StudyTask::query()
            ->where('user_id', $user->id)
            ->with('subject:id,name,color')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->get();

        $pending = $tasks->where('status', 'pending');

        // 7-day overview with the number of planned sessions per day.
        $today = Carbon::today();
        $overview = collect(range(0, 6))->map(function (int $offset) use ($today, $pending) {
            $date = $today->copy()->addDays($offset);

            return [
                'date' => $date->toDateString(),
                'weekday' => $date->isoFormat('ddd'),
                'day' => $date->format('d/m'),
                'count' => $pending->filter(fn ($t) => $t->scheduled_for->isSameDay($date))->count(),
            ];
        });

        return Inertia::render('Tarefas', [
            'overview' => [
                'days' => $overview,
                'plannedSessions' => $pending->count(),
            ],
            'upcoming' => $this->transform($pending->where('type', StudyTask::TYPE_THEORY)->values()),
            'reviews' => $this->transform($pending->where('type', StudyTask::TYPE_REVIEW)->values()),
            'completed' => $this->transform(
                $tasks->where('status', 'done')->sortByDesc('completed_at')->take(20)->values()
            ),
        ]);
    }

    /**
     * Task execution page.
     */
    public function show(Request $request, StudyTask $task): Response
    {
        $this->authorizeTask($request, $task);
        $task->load('subject:id,name,color', 'topic:id,name', 'cycle:id,name');

        // Progress within the day ("Tarefa 2 de 3").
        $dayTaskIds = StudyTask::query()
            ->where('user_id', $task->user_id)
            ->whereDate('scheduled_for', $task->scheduled_for)
            ->orderBy('position')
            ->pluck('id');
        $index = $dayTaskIds->search($task->id);

        return Inertia::render('TaskDetails', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'type' => $task->type,
                'format' => $task->format,
                'planned_minutes' => $task->planned_minutes,
                'subject' => $task->subject?->only('id', 'name', 'color'),
                'cycle' => $task->cycle?->only('id', 'name'),
            ],
            'progress' => [
                'current' => $index === false ? 1 : $index + 1,
                'total' => $dayTaskIds->count(),
            ],
            // Placeholder external link — the real lesson lives in the prep course.
            'externalUrl' => '#',
        ]);
    }

    /**
     * Register completion of a theory/review task and move to the next one.
     */
    public function complete(Request $request, StudyTask $task): RedirectResponse
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate([
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
        ]);

        if ($task->isDone()) {
            return redirect()->route('tarefas');
        }

        $seconds = $data['duration_seconds'] ?? 0;

        $task->update([
            'status' => 'done',
            'completed_at' => now(),
            'duration_seconds' => $seconds,
        ]);

        // Log a study session so it feeds the performance analytics.
        StudySession::create([
            'user_id' => $task->user_id,
            'study_cycle_id' => $task->study_cycle_id,
            'topic_id' => $task->topic_id,
            'studied_at' => now(),
            'duration_minutes' => $seconds > 0 ? (int) round($seconds / 60) : $task->planned_minutes,
        ]);

        // Advance to the next pending task, if any.
        $next = StudyTask::query()
            ->where('user_id', $task->user_id)
            ->where('status', 'pending')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->first();

        if ($next) {
            return redirect()
                ->route('tasks.show', $next)
                ->with('success', 'Tarefa concluída! Próxima na fila.');
        }

        return redirect()
            ->route('tarefas')
            ->with('success', 'Tudo em dia! Você concluiu as tarefas da fila.');
    }

    /**
     * @param  \Illuminate\Support\Collection<int, StudyTask>  $tasks
     * @return array<int, array<string, mixed>>
     */
    private function transform($tasks): array
    {
        return $tasks->map(fn (StudyTask $t) => [
            'id' => $t->id,
            'title' => $t->title,
            'type' => $t->type,
            'format' => $t->format,
            'planned_minutes' => $t->planned_minutes,
            'scheduled_for' => $t->scheduled_for->toDateString(),
            'scheduled_label' => $t->scheduled_for->isoFormat('ddd, DD/MM'),
            'completed_at' => $t->completed_at?->toDateTimeString(),
            'subject' => $t->subject?->only('id', 'name', 'color'),
        ])->all();
    }

    private function authorizeTask(Request $request, StudyTask $task): void
    {
        abort_unless($task->user_id === $this->currentUser($request)->id, 403);
    }

    private function currentUser(Request $request): User
    {
        return $request->user() ?: User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );
    }
}
