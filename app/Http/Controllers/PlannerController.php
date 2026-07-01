<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudyCycle;
use App\Models\StudyTask;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PlannerController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * "Metas do dia" — today's scheduled tasks and progress.
     */
    public function metas(Request $request): Response
    {
        $user = $this->currentUser($request);
        $today = Carbon::today();

        $planId = $this->activePlan($request)?->id;

        $tasks = StudyTask::query()
            ->where('user_id', $user->id)
            ->when($planId, fn ($q) => $q->where('study_cycle_id', $planId))
            ->whereDate('scheduled_for', $today)
            ->with('subject:id,name,color')
            ->orderBy('position')
            ->get();

        return Inertia::render('MetasDoDia', [
            'metas' => $tasks->map(fn (StudyTask $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'minutes' => $t->planned_minutes,
                'type' => $t->type,
                'format' => $t->format,
                'done' => $t->status === 'done',
                'subject' => $t->subject?->only('id', 'name', 'color'),
            ])->values(),
            'cycle' => $this->cycleSummary($user->id, $planId),
        ]);
    }

    /**
     * "Revisões" — review tasks, highlighting the ones due today.
     */
    public function revisoes(Request $request): Response
    {
        $user = $this->currentUser($request);
        $today = Carbon::today();

        $planId = $this->activePlan($request)?->id;

        $reviews = StudyTask::query()
            ->where('user_id', $user->id)
            ->when($planId, fn ($q) => $q->where('study_cycle_id', $planId))
            ->where('type', StudyTask::TYPE_REVIEW)
            ->with('subject:id,name,color')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->get();

        $dueToday = $reviews
            ->where('status', 'pending')
            ->filter(fn (StudyTask $t) => $t->scheduled_for->isSameDay($today))
            ->count();

        return Inertia::render('Revisoes', [
            'reviews' => $reviews->map(fn (StudyTask $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'due' => $t->scheduled_for->toDateString(),
                'due_label' => $t->scheduled_for->isSameDay($today)
                    ? 'Hoje'
                    : ($t->scheduled_for->isSameDay($today->copy()->addDay())
                        ? 'Amanhã'
                        : $t->scheduled_for->isoFormat('ddd, DD/MM')),
                'is_today' => $t->scheduled_for->isSameDay($today),
                'done' => $t->status === 'done',
                'subject' => $t->subject?->only('id', 'name', 'color'),
            ])->values(),
            'dueToday' => $dueToday,
        ]);
    }

    /**
     * "Meu plano semanal" — tasks laid out over the next 7 days.
     */
    public function plano(Request $request): Response
    {
        $user = $this->currentUser($request);
        $today = Carbon::today();

        $planId = $this->activePlan($request)?->id;

        $tasks = StudyTask::query()
            ->where('user_id', $user->id)
            ->when($planId, fn ($q) => $q->where('study_cycle_id', $planId))
            ->whereBetween('scheduled_for', [
                $today->toDateString(),
                $today->copy()->addDays(6)->toDateString(),
            ])
            ->with('subject:id,name,color')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->get();

        $days = collect(range(0, 6))->map(function (int $offset) use ($today, $tasks) {
            $date = $today->copy()->addDays($offset);
            $blocks = $tasks
                ->filter(fn (StudyTask $t) => $t->scheduled_for->isSameDay($date))
                ->map(fn (StudyTask $t) => [
                    'id' => $t->id,
                    'subject' => $t->subject?->name,
                    'color' => $t->subject?->color,
                    'minutes' => $t->planned_minutes,
                    'type' => $t->type,
                    'done' => $t->status === 'done',
                ])->values();

            return [
                'weekday' => $date->isoFormat('ddd'),
                'day' => $date->format('d/m'),
                'is_today' => $offset === 0,
                'blocks' => $blocks,
            ];
        });

        return Inertia::render('PlanoSemanal', [
            'days' => $days,
            'cycle' => $this->cycleSummary($user->id, $planId),
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function cycleSummary(int $userId, ?int $planId = null): ?array
    {
        $cycle = StudyCycle::query()
            ->where('user_id', $userId)
            ->when($planId, fn ($q) => $q->where('id', $planId))
            ->latest('id')
            ->first();

        return $cycle ? [
            'name' => $cycle->name,
            'weekly_tasks' => $cycle->weekly_tasks,
            'weekly_hours' => $cycle->weekly_hours,
        ] : null;
    }
}
