<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\Subject;
use App\Models\Topic;
use App\Services\CycleGeneratorService;
use App\Services\TaskSchedulerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Pastel palette for auto-assigning subject colors in a "plano
     * personalizado" — same values as the swatch picker in
     * resources/js/Components/CriarPlanejamentoModal.jsx, so custom subjects
     * look consistent with the rest of the UI.
     */
    private const PASTEL_COLORS = [
        '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0',
        '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd', '#bfdbfe',
        '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe', '#fbcfe8',
    ];

    /**
     * Shape a Course (with subjects/topics eager-loaded) into the wizard's
     * per-course payload — shared by the catalog listing and the "plano
     * personalizado" builder so both produce an identical shape.
     */
    private function presentCourse(Course $course): array
    {
        // Prefer the cargo name as the plan label (e.g. "Agente
        // Censitário de Qualidade (ACQ)") over the internal course name.
        // Custom courses have no cargo, so this falls back to the name the
        // student typed in.
        $cargo = $course->cargos->first();
        $label = $cargo
            ? $cargo->name.($cargo->code ? " ({$cargo->code})" : '')
            : $course->name;

        return [
            'id' => $course->id,
            'label' => $label,
            'orgao' => $course->orgao,
            'name' => $course->name,
            'subjects' => $course->subjects->map(fn ($subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'color' => $subject->color,
                'topics' => $subject->topics
                    ->map(fn ($topic) => ['id' => $topic->id, 'name' => $topic->name])
                    ->values(),
            ])->values(),
        ];
    }

    /**
     * Render the 6-step onboarding wizard with the available courses and their
     * subjects/topics (needed by steps 3-6).
     */
    public function index(Request $request): Response
    {
        $with = [
            'cargos:id,course_id,name,code',
            'subjects' => fn ($q) => $q->orderBy('name'),
            'subjects.topics' => fn ($q) => $q->studyable()->orderBy('order'),
        ];

        $user = $this->currentUser($request);

        $courses = Course::query()
            ->catalog()
            ->where('is_active', true)
            ->with($with)
            ->orderBy('name')
            ->get()
            ->map(fn (Course $course) => $this->presentCourse($course));

        // A "plano personalizado" just built by this student isn't part of the
        // shared catalog above (it's private), but the redirect back here after
        // creating it passes ?course= so it still shows up pre-selected.
        $preselectedCourseId = $request->integer('course') ?: null;
        if ($preselectedCourseId && ! $courses->contains('id', $preselectedCourseId)) {
            $customCourse = Course::query()
                ->where('id', $preselectedCourseId)
                ->where('user_id', $user->id)
                ->with($with)
                ->first();

            if ($customCourse) {
                $courses->prepend($this->presentCourse($customCourse));
            } else {
                $preselectedCourseId = null;
            }
        }

        return Inertia::render('Onboarding/Wizard', [
            'courses' => $courses->values(),
            'preselectedCourseId' => $preselectedCourseId,
            // Courses the student already has a plan for — one plan per cargo, so
            // these can't be picked again until the existing plan is deleted.
            'plannedCourseIds' => $user->studyCycles()->pluck('course_id')->all(),
            // "Criar plano personalizado" (Planos/Novo.jsx) links here with
            // ?personalizado=1 so Step 1 opens straight into the custom builder.
            'startPersonalizado' => $request->boolean('personalizado'),
        ]);
    }

    /**
     * "Plano personalizado" — build a private Course/Subject/Topic tree from
     * scratch (no catalog edital involved) and hand it back to Step 1 of the
     * wizard as if it had just been picked from the list.
     */
    public function storeCustom(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*.name' => ['required', 'string', 'max:255'],
            'subjects.*.topics' => ['array'],
            'subjects.*.topics.*' => ['string', 'max:1000'],
        ]);

        $user = $this->currentUser($request);

        $course = DB::transaction(function () use ($data, $user) {
            $course = Course::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'orgao' => null,
                'slug' => $this->uniqueCourseSlug($data['name']),
                'description' => null,
                'exam_board' => null,
                'is_active' => true,
            ]);

            $subjectIndex = 0;
            foreach ($data['subjects'] as $subjectData) {
                $subjectName = trim($subjectData['name']);
                if ($subjectName === '') {
                    continue;
                }

                $subject = Subject::create([
                    'course_id' => $course->id,
                    'name' => $subjectName,
                    'slug' => $this->uniqueSubjectSlug($course->id, $subjectName),
                    'weight' => 1,
                    'difficulty' => 3,
                    'color' => self::PASTEL_COLORS[$subjectIndex % count(self::PASTEL_COLORS)],
                ]);
                $subjectIndex++;

                $topics = collect($subjectData['topics'] ?? [])
                    ->map(fn ($t) => trim($t))
                    ->filter(fn ($t) => $t !== '')
                    ->values();

                foreach ($topics as $topicIndex => $topicName) {
                    Topic::create([
                        'subject_id' => $subject->id,
                        'parent_id' => null,
                        'name' => $topicName,
                        'order' => $topicIndex,
                        'estimated_minutes' => 30,
                    ]);
                }
            }

            return $course;
        });

        return redirect()->route('onboarding', ['course' => $course->id]);
    }

    /**
     * Unique-ify a course slug against the global unique index on
     * courses.slug — custom courses aren't shown by their slug anywhere, so a
     * short random suffix is enough (no need to keep it human-readable).
     */
    private function uniqueCourseSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'plano-personalizado';

        do {
            $slug = $base.'-'.Str::lower(Str::random(6));
        } while (Course::where('slug', $slug)->exists());

        return $slug;
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
     * Persist the onboarding choices and generate the study cycle (plan).
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'weekly_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'study_days' => ['array'],
            'study_days.*' => ['integer', 'between:0,6'],
            'min_session_minutes' => ['nullable', 'integer', 'min:1'],
            'max_session_minutes' => ['nullable', 'integer', 'min:1'],
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*.subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'subjects.*.importance' => ['required', 'numeric', 'between:1,5', CycleGeneratorService::halfStepRule()],
            'subjects.*.knowledge' => ['required', 'numeric', 'between:1,5', CycleGeneratorService::halfStepRule()],
            'studied_topics' => ['array'],
            'studied_topics.*' => ['integer', Rule::exists('topics', 'id')->where(fn ($q) => $q->whereDoesntHave('subtopics'))],
        ]);

        // Tela 3 do modal só pergunta horas/semana — deriva a contagem de
        // tarefas a partir da duração de sessão escolhida (média do
        // min/máx, ou a estimativa genérica se não informado) e quantas
        // por dia dado os dias escolhidos.
        $sessionMinutes = CycleGeneratorService::sessionMinutes(
            $data['min_session_minutes'] ?? null,
            $data['max_session_minutes'] ?? null,
        );
        $weeklyTasks = max(1, (int) round($data['weekly_hours'] * 60 / $sessionMinutes));
        $studyDaysCount = count($data['study_days'] ?? []) ?: 7;
        $dailyTasks = max(1, (int) ceil($weeklyTasks / $studyDaysCount));

        $user = $this->currentUser($request);
        $course = Course::with('cargos:id,course_id,name,code')->findOrFail($data['course_id']);

        // One plan per cargo/course. To recreate it, the student must delete the
        // existing plan for THIS cargo first (see PlanController@destroy).
        if ($user->planForCourse($course->id)) {
            return back()->with(
                'error',
                'Você já tem um plano para este cargo. Apague-o antes de criar outro.'
            );
        }

        $cargo = $course->cargos->first();
        $planLabel = $cargo
            ? $cargo->name.($cargo->code ? " ({$cargo->code})" : '')
            : $course->name;

        DB::transaction(function () use ($data, $user, $course, $planLabel, $weeklyTasks, $dailyTasks) {
            $cycle = StudyCycle::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'name' => 'Plano — '.$planLabel,
                'weekly_tasks' => $weeklyTasks,
                'daily_tasks' => $dailyTasks,
                'weekly_hours' => $data['weekly_hours'],
                'study_days' => $data['study_days'] ?? [],
                'min_session_minutes' => $data['min_session_minutes'] ?? null,
                'max_session_minutes' => $data['max_session_minutes'] ?? null,
                'status' => 'active',
                'generated_at' => now(),
                'onboarding_completed_at' => now(),
            ]);

            // Tela do modal: importância/conhecimento por disciplina (formato
            // sempre 'pdf' por enquanto — a etapa de escolher formato saiu do
            // fluxo de criação).
            $subjectPivot = collect($data['subjects'])
                ->mapWithKeys(fn (array $s) => [
                    $s['subject_id'] => [
                        'importance' => $s['importance'],
                        'knowledge' => $s['knowledge'],
                        'format' => 'pdf',
                    ],
                ])->all();
            $cycle->configuredSubjects()->sync($subjectPivot);

            // Já estudei: coberto pela página Edital Verticalizado; nenhum
            // tópico é pré-marcado na criação do plano.
            $studiedPivot = collect($data['studied_topics'] ?? [])
                ->mapWithKeys(fn (int $topicId) => [$topicId => ['already_studied' => true]])
                ->all();
            $cycle->studiedTopics()->sync($studiedPivot);

            // Assemble the plan and schedule the task queue.
            app(CycleGeneratorService::class)->generate($cycle, $data['subjects']);
            app(TaskSchedulerService::class)->schedule($cycle);
        });

        return redirect()
            ->route('planejamento')
            ->with('success', 'Seu plano de estudos foi montado com sucesso!');
    }
}
