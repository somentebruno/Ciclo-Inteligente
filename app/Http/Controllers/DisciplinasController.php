<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudySession;
use App\Models\Topic;
use Illuminate\Http\Request;
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
}
