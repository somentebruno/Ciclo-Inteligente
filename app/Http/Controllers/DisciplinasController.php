<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudyCycle;
use App\Models\StudySession;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DisciplinasController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * "Disciplinas" — catalog of the active plan's subjects, each with its
     * topics-studied/total (leaf topics, same "visto" signal as the edital
     * verticalizado checklist) and total questions resolved.
     */
    public function index(Request $request): Response
    {
        $plan = $this->activePlan($request);

        if (! $plan) {
            return Inertia::render('Disciplinas', ['hasPlan' => false]);
        }

        $subjects = $plan->course->subjects()->orderBy('id')->get(['id', 'name', 'color']);
        $subjectIds = $subjects->pluck('id');

        $studiedTopicIds = $plan->studiedTopics()->pluck('topics.id')->all();

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

        // One row per session (COALESCE picks the topic's subject when set,
        // otherwise the manual entry's cycle-item subject) so a session never
        // gets attributed to two subjects at once.
        $questionsBySubject = StudySession::query()
            ->where('study_sessions.study_cycle_id', $plan->id)
            ->leftJoin('topics', 'study_sessions.topic_id', '=', 'topics.id')
            ->leftJoin('study_cycle_items', 'study_sessions.study_cycle_item_id', '=', 'study_cycle_items.id')
            ->groupByRaw('COALESCE(topics.subject_id, study_cycle_items.subject_id)')
            ->selectRaw('COALESCE(topics.subject_id, study_cycle_items.subject_id) as subject_id, SUM(study_sessions.questions_total) as total')
            ->pluck('total', 'subject_id');

        $payload = $subjects->map(fn ($subject) => [
            'id' => $subject->id,
            'name' => $subject->name,
            'color' => $subject->color ?? '#94a3b8',
            'topics_studied' => (int) ($topicsStudiedBySubject[$subject->id] ?? 0),
            'topics_total' => (int) ($topicsTotalBySubject[$subject->id] ?? 0),
            'questions_resolved' => (int) ($questionsBySubject[$subject->id] ?? 0),
        ])->values();

        return Inertia::render('Disciplinas', [
            'hasPlan' => true,
            'subjects' => $payload,
        ]);
    }

    /**
     * Dedicated page for a single subject: its full topic tree (with
     * subtopics), which leaves are marked "estudado", and per-topic accuracy
     * — the "Visualizar" destination from a plan's discipline card. Scoped to
     * the subject's own owning cycle (see resolveCycleForSubject()) rather
     * than whichever plan happens to be active in the session, so it stays
     * correct regardless of which plan the student came from.
     */
    public function show(Request $request, Subject $subject): Response
    {
        $user = $this->currentUser($request);
        $cycle = $this->resolveCycleForSubject($user, $subject);

        $topics = $subject->topics()
            ->whereNull('parent_id')
            ->with(['subtopics' => fn ($q) => $q->orderBy('order')])
            ->orderBy('order')
            ->get();

        $studiedIds = $cycle->studiedTopics()->pluck('topics.id')->all();

        $perf = StudySession::query()
            ->where('study_cycle_id', $cycle->id)
            ->whereNotNull('topic_id')
            ->groupBy('topic_id')
            ->selectRaw('topic_id, SUM(questions_total) as qt, SUM(questions_correct) as qc')
            ->get()
            ->keyBy('topic_id');

        $accuracyFor = function ($topicId) use ($perf) {
            $stats = $perf->get($topicId);

            return $stats && $stats->qt > 0 ? (int) round($stats->qc / $stats->qt * 100) : null;
        };

        $leaf = fn ($topic, string $number) => [
            'id' => $topic->id,
            'name' => $topic->name,
            'number' => $number,
            'completed' => in_array($topic->id, $studiedIds, true),
            'accuracy' => $accuracyFor($topic->id),
            'subtopics' => [],
        ];

        $leafCount = 0;
        $completedCount = 0;

        $tree = $topics->values()->map(function ($topic, $i) use (&$leafCount, &$completedCount, $leaf) {
            $number = (string) ($i + 1);

            if ($topic->subtopics->isEmpty()) {
                $leafCount++;
                $node = $leaf($topic, $number);
                if ($node['completed']) {
                    $completedCount++;
                }

                return $node;
            }

            $subtopics = $topic->subtopics->values()->map(function ($sub, $j) use (&$leafCount, &$completedCount, $number, $leaf) {
                $leafCount++;
                $node = $leaf($sub, "{$number}.".($j + 1));
                if ($node['completed']) {
                    $completedCount++;
                }

                return $node;
            });

            return [
                'id' => $topic->id,
                'name' => $topic->name,
                'number' => $number,
                'completed' => null,
                'accuracy' => null,
                'subtopics' => $subtopics,
            ];
        })->values();

        $questionsResolved = (int) StudySession::query()
            ->where('study_cycle_id', $cycle->id)
            ->whereIn('topic_id', $subject->topics()->pluck('id'))
            ->sum('questions_total');

        return Inertia::render('Disciplinas/Show', [
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'color' => $subject->color ?? '#94a3b8',
            ],
            'plan_id' => $cycle->id,
            'stats' => [
                'topics_total' => $leafCount,
                'topics_completed' => $completedCount,
                'questions_resolved' => $questionsResolved,
            ],
            'topics' => $tree,
        ]);
    }

    /**
     * Update the subject's name/color and sync its top-level topics in one
     * go: the "Editar" popup submits the full desired topic list — entries
     * with an id are renamed, entries without one are created, and any
     * existing top-level topic missing from the list is removed (cascading
     * to its subtopics).
     */
    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $user = $this->currentUser($request);
        $this->resolveCycleForSubject($user, $subject);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
            'topics' => ['array'],
            'topics.*.id' => ['nullable', 'integer'],
            'topics.*.name' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($subject, $data) {
            $subject->update([
                'name' => $data['name'],
                'color' => $data['color'] ?? null,
            ]);

            $keepIds = [];

            foreach (($data['topics'] ?? []) as $order => $t) {
                if (! empty($t['id'])) {
                    $topic = Topic::where('id', $t['id'])
                        ->where('subject_id', $subject->id)
                        ->whereNull('parent_id')
                        ->first();

                    if ($topic) {
                        $topic->update(['name' => $t['name'], 'order' => $order]);
                        $keepIds[] = $topic->id;
                    }
                } else {
                    $topic = Topic::create([
                        'subject_id' => $subject->id,
                        'parent_id' => null,
                        'name' => $t['name'],
                        'order' => $order,
                        'estimated_minutes' => 30,
                    ]);
                    $keepIds[] = $topic->id;
                }
            }

            Topic::where('subject_id', $subject->id)
                ->whereNull('parent_id')
                ->whereNotIn('id', $keepIds)
                ->delete();
        });

        return back()->with('success', 'Disciplina atualizada.');
    }

    /**
     * Delete the subject (cascades to its topics, tasks and pivots).
     */
    public function destroy(Request $request, Subject $subject): RedirectResponse
    {
        $user = $this->currentUser($request);
        $this->resolveCycleForSubject($user, $subject);

        $subject->delete();

        return back()->with('success', 'Disciplina removida.');
    }

    /**
     * Toggle a topic's "visto" state from the subject's own page — shares the
     * `cycle_topic` pivot with the edital verticalizado checklist and
     * onboarding's "já estudei" step (same signal, written from a third place).
     */
    public function toggleTopic(Request $request, Subject $subject, Topic $topic): RedirectResponse
    {
        $user = $this->currentUser($request);
        $cycle = $this->resolveCycleForSubject($user, $subject);

        abort_unless($topic->subject_id === $subject->id, 404);
        abort_if($topic->subtopics()->exists(), 422);

        $cycle->studiedTopics()->toggle($topic->id);

        return back();
    }

    /**
     * The user's own study cycle for this subject's course — a subject is
     * only reachable through a plan the student built on top of its course,
     * and one plan per course/user is enforced at the database level, so
     * this is always unambiguous.
     */
    private function resolveCycleForSubject(User $user, Subject $subject): StudyCycle
    {
        $cycle = $user->studyCycles()->where('course_id', $subject->course_id)->first();

        abort_unless($cycle, 403);

        return $cycle;
    }
}
