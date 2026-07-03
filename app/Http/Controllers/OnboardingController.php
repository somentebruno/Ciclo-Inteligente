<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\Course;
use App\Models\StudyCycle;
use App\Services\CycleGeneratorService;
use App\Services\TaskSchedulerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Render the 6-step onboarding wizard with the available courses and their
     * subjects/topics (needed by steps 3-6).
     */
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->where('is_active', true)
            ->with([
                'cargos:id,course_id,name,code',
                'subjects' => fn ($q) => $q->orderBy('name'),
                'subjects.topics' => fn ($q) => $q->studyable()->orderBy('order'),
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Course $course) {
                // Prefer the cargo name as the plan label (e.g. "Agente
                // Censitário de Qualidade (ACQ)") over the internal course name.
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
            });

        $user = $this->currentUser($request);

        return Inertia::render('Onboarding/Wizard', [
            'courses' => $courses,
            'preselectedCourseId' => $request->integer('course') ?: null,
            // Courses the student already has a plan for — one plan per cargo, so
            // these can't be picked again until the existing plan is deleted.
            'plannedCourseIds' => $user->studyCycles()->pluck('course_id')->all(),
        ]);
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
