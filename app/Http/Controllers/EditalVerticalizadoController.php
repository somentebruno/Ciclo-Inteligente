<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudySession;
use App\Models\Topic;
use App\Models\TopicLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EditalVerticalizadoController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Full syllabus (edital) checklist for the active plan's course: every
     * subject and its topics, which ones are already marked as seen, and
     * per-topic/per-subject performance (acertos/erros/total/desempenho),
     * study recency and attached study-material links.
     */
    public function index(Request $request): Response
    {
        $plan = $this->activePlan($request);

        if (! $plan) {
            return Inertia::render('EditalVerticalizado', ['hasPlan' => false]);
        }

        $subjects = $plan->course->subjects()
            ->with([
                'topics' => fn ($q) => $q->whereNull('parent_id')
                    ->with([
                        'subtopics' => fn ($q2) => $q2->orderBy('order')->with('links'),
                        'links',
                    ])
                    ->orderBy('order'),
            ])
            ->orderBy('id')
            ->get();

        $studiedIds = $plan->studiedTopics()->pluck('topics.id')->all();

        $perf = StudySession::query()
            ->where('study_cycle_id', $plan->id)
            ->whereNotNull('topic_id')
            ->groupBy('topic_id')
            ->selectRaw('topic_id, SUM(questions_total) as qt, SUM(questions_correct) as qc, COUNT(*) as sessions_count, MAX(studied_at) as last_studied_at')
            ->get()
            ->keyBy('topic_id');

        $statsFor = function ($topicId) use ($perf) {
            $row = $perf->get($topicId);
            $qt = (int) ($row->qt ?? 0);
            $qc = (int) ($row->qc ?? 0);

            return [
                'acertos' => $qc,
                'erros' => $qt - $qc,
                'total_questoes' => $qt,
                'desempenho' => $qt > 0 ? (int) round($qc / $qt * 100) : 0,
                'times_studied' => (int) ($row->sessions_count ?? 0),
                'last_studied_at' => $row && $row->last_studied_at
                    ? Carbon::parse($row->last_studied_at)->format('d/m/Y')
                    : null,
            ];
        };

        $leaf = fn ($topic, string $number) => array_merge([
            'id' => $topic->id,
            'name' => $topic->name,
            'number' => $number,
            'completed' => in_array($topic->id, $studiedIds, true),
            'links' => $topic->links->map(fn ($l) => [
                'id' => $l->id,
                'title' => $l->title,
                'url' => $l->url,
            ])->values(),
            'subtopics' => [],
        ], $statsFor($topic->id));

        $payload = $subjects->map(function ($subject) use ($leaf) {
            $leafCount = 0;
            $completedCount = 0;
            $subjectQt = 0;
            $subjectQc = 0;

            $topics = $subject->topics->values()->map(
                function ($topic, $i) use (&$leafCount, &$completedCount, &$subjectQt, &$subjectQc, $leaf) {
                    $number = (string) ($i + 1);

                    if ($topic->subtopics->isEmpty()) {
                        $leafCount++;
                        $node = $leaf($topic, $number);
                        if ($node['completed']) {
                            $completedCount++;
                        }
                        $subjectQt += $node['total_questoes'];
                        $subjectQc += $node['acertos'];

                        return $node;
                    }

                    $subtopics = $topic->subtopics->values()->map(
                        function ($sub, $j) use (&$leafCount, &$completedCount, &$subjectQt, &$subjectQc, $number, $leaf) {
                            $leafCount++;
                            $node = $leaf($sub, "{$number}.".($j + 1));
                            if ($node['completed']) {
                                $completedCount++;
                            }
                            $subjectQt += $node['total_questoes'];
                            $subjectQc += $node['acertos'];

                            return $node;
                        }
                    );

                    return [
                        'id' => $topic->id,
                        'name' => $topic->name,
                        'number' => $number,
                        'completed' => null,
                        'subtopics' => $subtopics,
                    ];
                }
            )->values();

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'color' => $subject->color ?? '#94a3b8',
                'topics_total' => $leafCount,
                'topics_completed' => $completedCount,
                'topics' => $topics,
                'stats' => [
                    'acertos' => $subjectQc,
                    'erros' => $subjectQt - $subjectQc,
                    'total' => $subjectQt,
                    'desempenho' => $subjectQt > 0 ? (int) round($subjectQc / $subjectQt * 100) : 0,
                ],
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

    /**
     * Sync a topic's study-material links: entries with an id are updated,
     * entries without one are created, and any existing link missing from
     * the submitted list is removed.
     */
    public function updateLinks(Request $request, Topic $topic): RedirectResponse
    {
        $plan = $this->activePlan($request);
        abort_unless($plan, 404);
        abort_unless($topic->subject->course_id === $plan->course_id, 404);

        $data = $request->validate([
            'links' => ['array'],
            'links.*.id' => ['nullable', 'integer'],
            'links.*.title' => ['required', 'string', 'max:255'],
            'links.*.url' => ['required', 'string', 'max:2048'],
        ]);

        DB::transaction(function () use ($topic, $data) {
            $keepIds = [];

            foreach (($data['links'] ?? []) as $order => $l) {
                if (! empty($l['id'])) {
                    $link = TopicLink::where('id', $l['id'])->where('topic_id', $topic->id)->first();

                    if ($link) {
                        $link->update(['title' => $l['title'], 'url' => $l['url'], 'order' => $order]);
                        $keepIds[] = $link->id;
                    }
                } else {
                    $link = TopicLink::create([
                        'topic_id' => $topic->id,
                        'title' => $l['title'],
                        'url' => $l['url'],
                        'order' => $order,
                    ]);
                    $keepIds[] = $link->id;
                }
            }

            TopicLink::where('topic_id', $topic->id)->whereNotIn('id', $keepIds)->delete();
        });

        return back();
    }
}
