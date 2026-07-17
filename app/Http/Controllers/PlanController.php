<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\StudySession;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    use ResolvesCurrentUser;

    /** Título do card de catálogo por órgão. */
    private const CATALOG_TITLES = [
        'IBGE' => 'IBGE — Temporário 2026 (Pós-edital)',
    ];

    /**
     * The student's plans + the catalog of available concursos, grouped by órgão.
     * One plan per cargo: cargos whose course already has a plan are flagged so
     * the UI can offer to delete it instead of creating a duplicate.
     */
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->catalog()
            ->withCount(['subjects', 'topics'])
            ->with([
                'cargos:id,course_id,name,code',
                'subjects:id,course_id,name,color',
            ])
            ->orderBy('name')
            ->get();

        $catalog = $courses
            ->groupBy(fn (Course $course) => $course->orgao ?? 'Outros')
            ->map(fn ($group, $orgao) => [
                'orgao' => $orgao,
                'title' => self::CATALOG_TITLES[$orgao] ?? $orgao,
                'cargos' => $group->flatMap(fn (Course $course) => $course->cargos->map(fn ($cargo) => [
                    'id' => $cargo->id,
                    'course_id' => $course->id,
                    'name' => $cargo->name,
                    'code' => $cargo->code,
                    'subjects_count' => $course->subjects_count,
                    'topics_count' => $course->topics_count,
                    'subjects' => $course->subjects->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'color' => $s->color,
                    ])->values(),
                ]))->values(),
            ])
            ->values();

        $user = $this->currentUser($request);
        $activeId = $this->activePlan($request)?->id;

        $myPlans = $user->studyCycles()
            ->with([
                'course' => fn ($q) => $q->withCount(['subjects', 'topics'])->with('cargos:id,course_id,name,code'),
            ])
            ->latest('id')
            ->get(['id', 'name', 'course_id', 'status', 'created_at'])
            ->map(fn (StudyCycle $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'course_id' => $c->course_id,
                'is_active' => $c->id === $activeId,
                'is_archived' => $c->status === 'archived',
                'cargo_name' => $c->course?->cargos->first()?->name,
                'subjects_count' => $c->course?->subjects_count ?? 0,
                'topics_count' => $c->course?->topics_count ?? 0,
                'created_at' => $c->created_at->format('d/m/Y'),
            ]);

        return Inertia::render('Planos/Index', [
            'catalog' => $catalog,
            'myPlans' => $myPlans,
        ]);
    }

    /**
     * "Criar novo plano" page: search + personalized
     * plan + catalog of upcoming concursos (empty for now).
     */
    public function create(): Response
    {
        return Inertia::render('Planos/Novo', [
            // Catalog of upcoming concursos, grouped by órgão. Empty for now.
            'upcoming' => [],
        ]);
    }

    /**
     * Plan detail: the plan's own card (edital/cargo/disciplinas/tópicos/
     * observações), the study-time/questions/desempenho summary, and a card
     * per subject with topics-studied/total and questions resolved — same
     * "visto" signal as the edital verticalizado checklist and the
     * Disciplinas overview, but scoped to this specific plan rather than
     * whichever one is currently active.
     */
    public function show(Request $request, StudyCycle $cycle): Response
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $cycle->loadMissing([
            'course' => fn ($q) => $q->withCount(['subjects', 'topics'])->with('cargos:id,course_id,name,code'),
        ]);

        $course = $cycle->course;

        $subjects = $course->subjects()->orderBy('id')->get(['id', 'name', 'color']);
        $subjectIds = $subjects->pluck('id');

        $studiedTopicIds = $cycle->studiedTopics()->pluck('topics.id')->all();

        $topicsTotalBySubject = Topic::query()
            ->studyable()
            ->whereIn('subject_id', $subjectIds)
            ->groupBy('subject_id')
            ->selectRaw('subject_id, COUNT(*) as total')
            ->pluck('total', 'subject_id');

        $topicsStudiedBySubject = Topic::query()
            ->studyable()
            ->whereIn('subject_id', $subjectIds)
            ->whereIn('id', $studiedTopicIds)
            ->groupBy('subject_id')
            ->selectRaw('subject_id, COUNT(*) as total')
            ->pluck('total', 'subject_id');

        $questionsBySubject = StudySession::query()
            ->where('study_sessions.study_cycle_id', $cycle->id)
            ->leftJoin('topics', 'study_sessions.topic_id', '=', 'topics.id')
            ->leftJoin('study_cycle_items', 'study_sessions.study_cycle_item_id', '=', 'study_cycle_items.id')
            ->groupByRaw('COALESCE(topics.subject_id, study_cycle_items.subject_id)')
            ->selectRaw('COALESCE(topics.subject_id, study_cycle_items.subject_id) as subject_id, SUM(study_sessions.questions_total) as total')
            ->pluck('total', 'subject_id');

        // Top-level topics only — the "Editar" popup's flat topics list.
        $topicsBySubject = Topic::query()
            ->whereNull('parent_id')
            ->whereIn('subject_id', $subjectIds)
            ->orderBy('order')
            ->get(['id', 'subject_id', 'name'])
            ->groupBy('subject_id');

        $subjectsPayload = $subjects->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'color' => $s->color ?? '#94a3b8',
            'topics_studied' => (int) ($topicsStudiedBySubject[$s->id] ?? 0),
            'topics_total' => (int) ($topicsTotalBySubject[$s->id] ?? 0),
            'questions_resolved' => (int) ($questionsBySubject[$s->id] ?? 0),
            'topics' => ($topicsBySubject[$s->id] ?? collect())
                ->map(fn ($t) => ['id' => $t->id, 'name' => $t->name])
                ->values(),
        ])->values();

        $totals = StudySession::query()
            ->where('study_cycle_id', $cycle->id)
            ->selectRaw('COALESCE(SUM(duration_minutes), 0) as minutes, COALESCE(SUM(questions_total), 0) as qt, COALESCE(SUM(questions_correct), 0) as qc')
            ->first();
        $accuracy = $totals->qt > 0 ? (int) round($totals->qc / $totals->qt * 100) : 0;

        return Inertia::render('Planos/Show', [
            'plan' => [
                'id' => $cycle->id,
                'name' => $cycle->name,
                'observacoes' => $cycle->observacoes,
                'is_archived' => $cycle->status === 'archived',
                'edital' => $this->editalLabel($course),
                'cargo_name' => $course->cargos->first()?->name,
                'subjects_count' => $course->subjects_count,
                'topics_count' => $course->topics_count,
                'created_at' => $cycle->created_at->format('d/m/Y'),
            ],
            'stats' => [
                'study_time' => $this->formatHoursMinutes((int) $totals->minutes),
                'questions_total' => (int) $totals->qt,
                'accuracy' => $accuracy,
            ],
            'subjects' => $subjectsPayload,
        ]);
    }

    /**
     * Rename the plan and/or update its free-text notes.
     */
    public function update(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'observacoes' => ['nullable', 'string', 'max:2000'],
        ]);

        $cycle->update($data);

        return back()->with('success', 'Plano atualizado.');
    }

    /**
     * Toggle the plan between active and archived. Archived plans stay
     * visible on /planos (tagged "Arquivado") rather than disappearing.
     */
    public function archive(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $archiving = $cycle->status !== 'archived';
        $cycle->update(['status' => $archiving ? 'archived' : 'active']);

        return back()->with('success', $archiving ? 'Plano arquivado.' : 'Plano reativado.');
    }

    /**
     * Add a new subject to the plan's course from the "Nova Disciplina" button.
     */
    public function storeSubject(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
        ]);

        Subject::create([
            'course_id' => $cycle->course_id,
            'name' => $data['name'],
            'slug' => $this->uniqueSubjectSlug($cycle->course_id, $data['name']),
            'weight' => 1,
            'difficulty' => 3,
            'color' => $data['color'] ?? null,
        ]);

        return back()->with('success', 'Disciplina criada.');
    }

    /**
     * The label shown for "Editais" on the plan card: the catalog concurso
     * title for a plan built from an edital, or "Personalizado" for a
     * private course the student built from scratch (see Course::scopeCatalog()).
     */
    private function editalLabel(Course $course): string
    {
        if ($course->user_id !== null) {
            return 'Personalizado';
        }

        return self::CATALOG_TITLES[$course->orgao] ?? $course->orgao ?? $course->name;
    }

    private function formatHoursMinutes(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        return "{$h}h".str_pad((string) $m, 2, '0', STR_PAD_LEFT).'min';
    }

    /**
     * Unique-ify a subject slug within its course (unique(['course_id','slug'])).
     */
    private function uniqueSubjectSlug(int $courseId, string $name): string
    {
        $base = Str::slug($name) ?: 'disciplina';
        $slug = $base;
        $suffix = 2;

        while (Subject::where('course_id', $courseId)->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    /**
     * Make the given plan the one the user is currently viewing.
     */
    public function activate(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $request->session()->put('active_cycle_id', $cycle->id);

        return back()->with('success', 'Plano ativo atualizado.');
    }

    /**
     * Delete one of the student's plans (study cycle). Cascades to its items,
     * tasks and pivots; study sessions are preserved (FK set to null). This is
     * what frees the cargo so a new plan can be created for it.
     *
     * When the plan was built on a private "plano personalizado" course (never
     * shared with anyone else), delete that Course instead — it cascades down
     * to the cycle anyway, and also cleans up the ad-hoc subjects/topics
     * instead of leaving them orphaned.
     */
    public function destroy(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $cycle->loadMissing('course');

        if ($cycle->course && $cycle->course->user_id === $user->id) {
            $cycle->course->delete();
        } else {
            $cycle->delete();
        }

        return redirect()->route('planos')->with('success', 'Plano apagado.');
    }
}
