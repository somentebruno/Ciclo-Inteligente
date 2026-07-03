<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudySession;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EditalVerticalizadoController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Full syllabus (edital) checklist for the active plan's course: every
     * subject and its topics, which ones are already marked as seen, and
     * accuracy per topic from logged study sessions.
     */
    public function index(Request $request): Response
    {
        $plan = $this->activePlan($request);

        if (! $plan) {
            return Inertia::render('EditalVerticalizado', ['hasPlan' => false]);
        }

        $subjects = $plan->course->subjects()
            ->with(['topics' => fn ($q) => $q->whereNull('parent_id')
                ->with(['subtopics' => fn ($q2) => $q2->orderBy('order')])
                ->orderBy('order')])
            ->orderBy('id')
            ->get();

        $studiedIds = $plan->studiedTopics()->pluck('topics.id')->all();

        $perf = StudySession::query()
            ->where('study_cycle_id', $plan->id)
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

        $payload = $subjects->map(function ($subject) use ($leaf) {
            $leafCount = 0;
            $completedCount = 0;

            $topics = $subject->topics->values()->map(function ($topic, $i) use (&$leafCount, &$completedCount, $leaf) {
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

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'color' => $subject->color ?? '#94a3b8',
                'topics_total' => $leafCount,
                'topics_completed' => $completedCount,
                'topics' => $topics,
            ];
        })->values();

        return Inertia::render('EditalVerticalizado', [
            'hasPlan' => true,
            'total_topics' => $payload->sum('topics_total'),
            'completed_topics' => $payload->sum('topics_completed'),
            'subjects' => $payload,
        ]);
    }

    /**
     * Toggle a topic's "visto" state — shares the `cycle_topic` pivot with
     * onboarding's "já estudei" checklist (same signal, written from a
     * second place).
     */
    public function toggleTopic(Request $request, Topic $topic): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);
        abort_unless($topic->subject->course_id === $plan->course_id, 404);
        abort_if($topic->subtopics()->exists(), 422);

        $plan->studiedTopics()->toggle($topic->id);

        return back();
    }
}
