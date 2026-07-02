<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudySession;
use App\Models\StudyTask;
use App\Services\TaskSchedulerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanejamentoController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * "Planejamento" — the study-cycle (ciclo de estudos) view: the ordered
     * rotation of subjects, time studied vs planned in the current lap, overall
     * progress and completed laps.
     */
    public function index(Request $request): Response
    {
        $plan = $this->activePlan($request);

        if (! $plan) {
            return Inertia::render('Planejamento', ['cycle' => null]);
        }

        $items = $plan->items()->with('subject:id,name,color')->get();

        // Minutes studied per subject in the current lap, fed by the study
        // sessions logged through the completion modal.
        $since = $plan->lap_started_at ?? $plan->created_at;
        $studiedBySubject = StudySession::query()
            ->where('study_sessions.study_cycle_id', $plan->id)
            ->where('study_sessions.studied_at', '>=', $since)
            ->join('topics', 'study_sessions.topic_id', '=', 'topics.id')
            ->groupBy('topics.subject_id')
            ->selectRaw('topics.subject_id as subject_id, SUM(duration_minutes) as minutes')
            ->pluck('minutes', 'subject_id');

        $sequence = $items->map(function ($item) use ($studiedBySubject) {
            $studied = (int) ($studiedBySubject[$item->subject_id] ?? 0);

            return [
                'id' => $item->id,
                'subject' => $item->subject?->name ?? '—',
                'color' => $item->subject?->color ?? '#94a3b8',
                'planned_minutes' => $item->planned_minutes,
                'studied_minutes' => $studied,
                'pct' => $item->planned_minutes > 0
                    ? min(100, round($studied / $item->planned_minutes * 100, 2))
                    : 0,
            ];
        })->values();

        $planned = $sequence->sum('planned_minutes');
        $studied = $sequence->sum(fn ($s) => min($s['studied_minutes'], $s['planned_minutes']));

        $nextTask = StudyTask::query()
            ->where('user_id', $plan->user_id)
            ->where('study_cycle_id', $plan->id)
            ->where('status', 'pending')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->first(['id']);

        return Inertia::render('Planejamento', [
            'cycle' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'completed_laps' => $plan->completed_laps,
                'planned_minutes' => $planned,
                'studied_minutes' => $studied,
                'pct' => $planned > 0 ? round($studied / $planned * 100, 2) : 0,
                'sequence' => $sequence,
            ],
            'nextTaskId' => $nextTask?->id,
        ]);
    }

    /**
     * Restart the cycle: counts a completed lap and starts measuring the new
     * lap's progress from now.
     */
    public function restart(Request $request): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);

        $plan->update([
            'completed_laps' => $plan->completed_laps + 1,
            'lap_started_at' => now(),
        ]);

        return back()->with('success', 'Ciclo recomeçado! Bora para a próxima volta.');
    }

    /**
     * Rebuild the pending task queue from today (keeps completed history).
     */
    public function replan(Request $request): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);

        app(TaskSchedulerService::class)->schedule($plan);

        return back()->with('success', 'Fila de tarefas replanejada a partir de hoje.');
    }
}
