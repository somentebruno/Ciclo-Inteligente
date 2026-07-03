<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudyCycleItem;
use App\Models\StudySession;
use App\Models\StudyTask;
use App\Models\Topic;
use App\Services\TaskSchedulerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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

        $items = $plan->items()
            ->with([
                'subject:id,name,color',
                'subject.topics' => fn ($q) => $q->studyable()->orderBy('order'),
                'subject.aulas' => fn ($q) => $q->orderBy('order'),
            ])
            ->get();

        // Minutes studied per subject in the current lap, fed by the study
        // sessions logged through the completion modal (linked via topic) and
        // manual entries logged straight from this page (linked via the cycle
        // item, since those have no specific topic/aula attached).
        $since = $plan->lap_started_at ?? $plan->created_at;
        $baseSessions = fn () => StudySession::query()
            ->where('study_sessions.study_cycle_id', $plan->id)
            ->where('study_sessions.studied_at', '>=', $since);

        $fromTasks = $baseSessions()
            ->whereNotNull('topic_id')
            ->join('topics', 'study_sessions.topic_id', '=', 'topics.id')
            ->groupBy('topics.subject_id')
            ->selectRaw('topics.subject_id as subject_id, SUM(duration_minutes) as minutes')
            ->pluck('minutes', 'subject_id');

        $fromManual = $baseSessions()
            ->whereNotNull('study_cycle_item_id')
            ->where('counts_in_plan', true)
            ->join('study_cycle_items', 'study_sessions.study_cycle_item_id', '=', 'study_cycle_items.id')
            ->groupBy('study_cycle_items.subject_id')
            ->selectRaw('study_cycle_items.subject_id as subject_id, SUM(duration_minutes) as minutes')
            ->pluck('minutes', 'subject_id');

        $studiedBySubject = $fromTasks->keys()
            ->merge($fromManual->keys())
            ->unique()
            ->mapWithKeys(fn ($id) => [$id => ($fromTasks[$id] ?? 0) + ($fromManual[$id] ?? 0)]);

        // Next pending task per subject, and the last few sessions logged for it
        // (either via a task or a manual entry), for the card's submenu actions.
        $nextTaskBySubject = StudyTask::query()
            ->where('study_cycle_id', $plan->id)
            ->where('status', 'pending')
            ->orderBy('scheduled_for')
            ->orderBy('position')
            ->get(['id', 'subject_id'])
            ->unique('subject_id')
            ->pluck('id', 'subject_id');

        $recentBySubject = StudySession::query()
            ->where('study_sessions.study_cycle_id', $plan->id)
            ->whereNotNull('study_sessions.duration_minutes')
            ->leftJoin('topics', 'study_sessions.topic_id', '=', 'topics.id')
            ->leftJoin('aulas', 'study_sessions.aula_id', '=', 'aulas.id')
            ->leftJoin('study_cycle_items', 'study_sessions.study_cycle_item_id', '=', 'study_cycle_items.id')
            ->selectRaw(
                'study_sessions.*, topics.name as topic_name, aulas.name as aula_name, '.
                'COALESCE(topics.subject_id, study_cycle_items.subject_id) as resolved_subject_id'
            )
            ->orderByDesc('studied_at')
            ->get()
            ->groupBy('resolved_subject_id');

        // Each subject can now span several small blocks (the real "ciclo de
        // estudos" rotation) instead of one lump item, so the subject's
        // studied total is consumed sequentially in position order — the
        // earliest block(s) of a subject fill up before later ones, instead
        // of every block showing the same subject-wide percentage.
        $remainingBySubject = $studiedBySubject->toArray();

        $sequence = $items->map(function ($item) use (&$remainingBySubject, $nextTaskBySubject, $recentBySubject) {
            $remaining = (int) ($remainingBySubject[$item->subject_id] ?? 0);
            $studied = min($remaining, $item->planned_minutes);
            $remainingBySubject[$item->subject_id] = $remaining - $studied;

            return [
                'id' => $item->id,
                'subject_id' => $item->subject_id,
                'subject' => $item->subject?->name ?? '—',
                'color' => $item->subject?->color ?? '#94a3b8',
                'planned_minutes' => $item->planned_minutes,
                'studied_minutes' => $studied,
                'pct' => $item->planned_minutes > 0
                    ? min(100, round($studied / $item->planned_minutes * 100, 2))
                    : 0,
                'next_task_id' => $nextTaskBySubject[$item->subject_id] ?? null,
                'topics' => ($item->subject?->topics ?? collect())
                    ->values()
                    ->map(fn ($t, $i) => [
                        'id' => $t->id,
                        'label' => ($i + 1).' '.$t->name,
                        'minutes' => $t->estimated_minutes,
                    ])
                    ->values(),
                'aulas' => ($item->subject?->aulas ?? collect())
                    ->values()
                    ->map(fn ($a) => [
                        'id' => $a->id,
                        'label' => $a->name,
                        'minutes' => $a->minutes,
                    ])
                    ->values(),
                'recent_sessions' => ($recentBySubject[$item->subject_id] ?? collect())
                    ->take(30)
                    ->map(fn ($s) => [
                        'id' => $s->id,
                        'date' => Carbon::parse($s->studied_at)->toDateString(),
                        'subject' => $item->subject?->name ?? '—',
                        'topic' => $s->topic_name,
                        'source' => $s->source,
                        'aula_name' => $s->aula_name,
                        'category' => $s->category,
                        'material' => $s->material,
                        'pages_read' => $s->pages_read,
                        'duration_minutes' => $s->duration_minutes,
                        'questions_total' => $s->questions_total,
                        'questions_correct' => $s->questions_correct,
                        'notes' => $s->notes,
                    ])
                    ->values(),
            ];
        })->values();

        $planned = $sequence->sum('planned_minutes');
        $studied = $sequence->sum(fn ($s) => min($s['studied_minutes'], $s['planned_minutes']));

        // One aggregated row per subject (summing its blocks back together) —
        // the donut and its legend want one slice per subject, not one per
        // small block.
        $bySubject = $sequence
            ->groupBy('subject_id')
            ->map(fn ($rows) => [
                'id' => $rows->first()['subject_id'],
                'subject' => $rows->first()['subject'],
                'color' => $rows->first()['color'],
                'planned_minutes' => $rows->sum('planned_minutes'),
                'studied_minutes' => $rows->sum('studied_minutes'),
            ])
            ->values();

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
                'by_subject' => $bySubject,
            ],
            'nextTaskId' => $nextTask?->id,
            // Disciplinas do curso do plano — alimenta o seletor de troca de
            // disciplina no modo "Editar Ciclo".
            'course_subjects' => $plan->course->subjects()
                ->orderBy('id')
                ->get(['id', 'name', 'color']),
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

    /**
     * "Editar Ciclo" — add a new rotation block, defaulting to the course's
     * first subject (the student picks the real one from the row's dropdown
     * right after).
     */
    public function storeItem(Request $request): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);

        $subjectId = $plan->course->subjects()->orderBy('id')->value('id');
        abort_unless($subjectId, 422);

        StudyCycleItem::create([
            'study_cycle_id' => $plan->id,
            'subject_id' => $subjectId,
            'position' => ($plan->items()->max('position') ?? 0) + 1,
            'planned_minutes' => 60,
            'completed_minutes' => 0,
            'is_done' => false,
        ]);

        return back()->with('success', 'Disciplina adicionada ao ciclo.');
    }

    /**
     * "Editar Ciclo" — persist the drag-and-drop reorder of the rotation.
     */
    public function reorderItems(Request $request): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);

        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', Rule::exists('study_cycle_items', 'id')->where(fn ($q) => $q->where('study_cycle_id', $plan->id))],
        ]);

        // Every item must be accounted for — a partial list would silently
        // orphan the missing ones at whatever position they already had.
        abort_unless(count($data['order']) === $plan->items()->count(), 422);

        // (study_cycle_id, position) is unique, so writing final positions
        // one row at a time can collide with a row that hasn't moved yet
        // (e.g. swapping 0<->1 tries to set position 0 while another row is
        // still sitting on 0). Stage everything on negative positions first,
        // then commit the real ones — negatives never collide with the
        // unsigned positions already in use.
        DB::transaction(function () use ($data) {
            foreach ($data['order'] as $position => $itemId) {
                StudyCycleItem::where('id', $itemId)->update(['position' => -($position + 1)]);
            }
            foreach ($data['order'] as $position => $itemId) {
                StudyCycleItem::where('id', $itemId)->update(['position' => $position]);
            }
        });

        return back();
    }

    /**
     * "Editar Ciclo" — change which subject a rotation block represents
     * and/or its planned minutes. Only affects StudyCycleItem (the rotation
     * shown here and in the donut) — doesn't touch configuredSubjects or the
     * task queue; use "Replanejar" separately if those should follow suit.
     */
    public function updateItem(Request $request, StudyCycleItem $item): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);
        abort_unless($item->study_cycle_id === $plan->id, 404);

        $data = $request->validate([
            'subject_id' => ['nullable', 'integer', Rule::exists('subjects', 'id')->where(fn ($q) => $q->where('course_id', $plan->course_id))],
            'planned_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
        ]);

        $item->update($data);

        return back();
    }

    /**
     * Clone a rotation block (same subject/minutes, fresh progress) and
     * append it to the end of the sequence.
     */
    public function duplicateItem(Request $request, StudyCycleItem $item): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);
        abort_unless($item->study_cycle_id === $plan->id, 404);

        StudyCycleItem::create([
            'study_cycle_id' => $plan->id,
            'subject_id' => $item->subject_id,
            'position' => ($plan->items()->max('position') ?? 0) + 1,
            'planned_minutes' => $item->planned_minutes,
            'completed_minutes' => 0,
            'is_done' => false,
        ]);

        return back()->with('success', 'Disciplina duplicada.');
    }

    /**
     * Remove a rotation block from the sequence.
     */
    public function destroyItem(Request $request, StudyCycleItem $item): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);
        abort_unless($item->study_cycle_id === $plan->id, 404);

        $item->delete();

        return back()->with('success', 'Disciplina removida do ciclo.');
    }

    /**
     * "Registro de Estudo" — log a study session for a subject outside the task
     * queue (e.g. extra practice, reading, video lessons), with an optional
     * date, topic, review scheduling and theory-completion side effects.
     */
    public function storeManualSession(Request $request): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);

        $data = $request->validate([
            'study_cycle_item_id' => ['required', 'integer'],
            'date' => ['nullable', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'source' => ['nullable', 'string', 'in:aula,pdf,outro'],
            'aula_id' => ['nullable', 'integer', 'exists:aulas,id'],
            'category' => ['nullable', 'string', 'max:100'],
            'material' => ['nullable', 'string', 'max:255'],
            'pages_read' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'questions_total' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'questions_correct' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'count_in_plan' => ['boolean'],
            'theory_completed' => ['boolean'],
            'review_intervals' => ['array'],
            'review_intervals.*' => ['integer', 'min:1', 'max:365'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $item = StudyCycleItem::query()
            ->where('id', $data['study_cycle_item_id'])
            ->where('study_cycle_id', $plan->id)
            ->firstOrFail();

        // questions_total/questions_correct are NOT NULL (default 0) — Model::accuracy()
        // already treats a 0 total as "no questions logged", so default to 0 rather
        // than passing an explicit null that the DB would reject.
        $total = $data['questions_total'] ?? 0;
        $correct = min($data['questions_correct'] ?? 0, $total);

        $studiedAt = isset($data['date']) ? Carbon::parse($data['date'])->setTimeFrom(now()) : now();

        StudySession::create([
            'user_id' => $plan->user_id,
            'study_cycle_id' => $plan->id,
            'study_cycle_item_id' => $item->id,
            'topic_id' => $data['topic_id'] ?? null,
            'source' => $data['source'] ?? null,
            'aula_id' => $data['aula_id'] ?? null,
            'category' => $data['category'] ?? null,
            'material' => $data['material'] ?? null,
            'pages_read' => $data['pages_read'] ?? null,
            // Whether it's attributed to the cycle's progress bars — the
            // session still stays linked to its subject either way.
            'counts_in_plan' => $data['count_in_plan'] ?? true,
            'studied_at' => $studiedAt,
            'duration_minutes' => $data['duration_minutes'],
            'questions_total' => $total,
            'questions_correct' => $correct,
            'notes' => $data['notes'] ?? null,
        ]);

        // "Teoria finalizada" — mirrors the task-completion flow: closes the
        // subject's next pending theory task, if any.
        if (! empty($data['theory_completed'])) {
            StudyTask::query()
                ->where('study_cycle_id', $plan->id)
                ->where('subject_id', $item->subject_id)
                ->where('type', StudyTask::TYPE_THEORY)
                ->where('status', 'pending')
                ->orderBy('scheduled_for')
                ->orderBy('position')
                ->first()
                ?->update(['status' => 'done', 'completed_at' => now()]);
        }

        // "Programar revisões" — creates a review task for each interval tag.
        if (! empty($data['review_intervals'])) {
            $title = isset($data['topic_id']) ? Topic::find($data['topic_id'])?->name : null;
            $title ??= $item->subject?->name ?? 'Revisão';
            $baseDate = $studiedAt->copy()->startOfDay();

            foreach ($data['review_intervals'] as $days) {
                StudyTask::create([
                    'user_id' => $plan->user_id,
                    'study_cycle_id' => $plan->id,
                    'subject_id' => $item->subject_id,
                    'topic_id' => $data['topic_id'] ?? null,
                    'title' => $title,
                    'type' => StudyTask::TYPE_REVIEW,
                    'format' => 'pdf',
                    'planned_minutes' => 45,
                    'scheduled_for' => $baseDate->copy()->addDays($days),
                    'position' => 0,
                    'status' => 'pending',
                ]);
            }
        }

        return back()->with('success', 'Estudo registrado.');
    }
}
