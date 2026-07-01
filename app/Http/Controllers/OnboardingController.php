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
                'subjects.topics' => fn ($q) => $q->orderBy('order'),
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

        return Inertia::render('Onboarding/Wizard', [
            'courses' => $courses,
            'preselectedCourseId' => $request->integer('course') ?: null,
        ]);
    }

    /**
     * Persist the onboarding choices and generate the study cycle (plan).
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'weekly_tasks' => ['required', 'integer', 'min:1', 'max:100'],
            'daily_tasks' => ['nullable', 'integer', 'min:1', 'max:20'],
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*.subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'subjects.*.difficulty' => ['required', Rule::in(['facil', 'medio', 'dificil'])],
            'subjects.*.format' => ['required', Rule::in(['pdf', 'video'])],
            'studied_topics' => ['array'],
            'studied_topics.*' => ['integer', 'exists:topics,id'],
        ]);

        $user = $this->currentUser($request);
        $course = Course::with('cargos:id,course_id,name,code')->findOrFail($data['course_id']);

        $cargo = $course->cargos->first();
        $planLabel = $cargo
            ? $cargo->name.($cargo->code ? " ({$cargo->code})" : '')
            : $course->name;

        DB::transaction(function () use ($data, $user, $course, $planLabel) {
            // Only one active cycle per user/course; archive the previous ones.
            StudyCycle::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->where('status', 'active')
                ->update(['status' => 'archived']);

            $cycle = StudyCycle::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'name' => 'Plano — '.$planLabel,
                'weekly_tasks' => $data['weekly_tasks'],
                'daily_tasks' => $data['daily_tasks'] ?? null,
                'weekly_hours' => (int) round($data['weekly_tasks'] * (CycleGeneratorService::MINUTES_PER_TASK / 60)),
                'status' => 'active',
                'generated_at' => now(),
                'onboarding_completed_at' => now(),
            ]);

            // Steps 3-5: per-subject difficulty & format.
            $subjectPivot = collect($data['subjects'])
                ->mapWithKeys(fn (array $s) => [
                    $s['subject_id'] => [
                        'difficulty' => $s['difficulty'],
                        'format' => $s['format'],
                    ],
                ])->all();
            $cycle->configuredSubjects()->sync($subjectPivot);

            // Step 6: already-studied topics.
            $studiedPivot = collect($data['studied_topics'] ?? [])
                ->mapWithKeys(fn (int $topicId) => [$topicId => ['already_studied' => true]])
                ->all();
            $cycle->studiedTopics()->sync($studiedPivot);

            // Assemble the plan and schedule the task queue.
            app(CycleGeneratorService::class)->generate($cycle, $data['subjects']);
            app(TaskSchedulerService::class)->schedule($cycle);
        });

        return redirect()
            ->route('plano-semanal')
            ->with('success', 'Seu plano de estudos foi montado com sucesso!');
    }
}
