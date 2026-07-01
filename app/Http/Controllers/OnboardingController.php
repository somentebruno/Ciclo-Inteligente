<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\User;
use App\Services\CycleGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Render the 6-step onboarding wizard with the available courses and their
     * subjects/topics (needed by steps 3-6).
     */
    public function index(): Response
    {
        $courses = Course::query()
            ->where('is_active', true)
            ->with([
                'subjects' => fn ($q) => $q->orderBy('name'),
                'subjects.topics' => fn ($q) => $q->orderBy('order'),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'name' => $course->name,
                'exam_board' => $course->exam_board,
                'subjects' => $course->subjects->map(fn ($subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'color' => $subject->color,
                    'topics' => $subject->topics
                        ->map(fn ($topic) => ['id' => $topic->id, 'name' => $topic->name])
                        ->values(),
                ])->values(),
            ]);

        return Inertia::render('Onboarding/Wizard', [
            'courses' => $courses,
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
        $course = Course::findOrFail($data['course_id']);

        DB::transaction(function () use ($data, $user, $course) {
            // Only one active cycle per user/course; archive the previous ones.
            StudyCycle::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->where('status', 'active')
                ->update(['status' => 'archived']);

            $cycle = StudyCycle::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'name' => 'Plano — '.$course->name,
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

            // Assemble the plan.
            app(CycleGeneratorService::class)->generate($cycle, $data['subjects']);
        });

        return redirect()
            ->route('plano-semanal')
            ->with('success', 'Seu plano de estudos foi montado com sucesso!');
    }

    /**
     * Resolve the acting user. Falls back to the demo student while auth
     * (Breeze) is not wired up yet.
     */
    private function currentUser(Request $request): User
    {
        return $request->user() ?: User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );
    }
}
