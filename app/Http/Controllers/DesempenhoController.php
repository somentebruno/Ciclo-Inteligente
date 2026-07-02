<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudySession;
use App\Models\StudyTask;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DesempenhoController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Performance analytics scoped to the active plan.
     */
    public function index(Request $request): Response
    {
        $user = $this->currentUser($request);
        $planId = $this->activePlan($request)?->id;

        return Inertia::render('Desempenho', [
            'hasPlan' => (bool) $planId,
            'stats' => $planId ? $this->stats($user->id, $planId) : [],
            'porDisciplina' => $planId ? $this->accuracyBySubject($user->id, $planId) : [],
        ]);
    }

    /**
     * The four summary cards.
     *
     * @return array<int, array<string, mixed>>
     */
    private function stats(int $userId, int $planId): array
    {
        $today = Carbon::today();
        $sessions = fn () => StudySession::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId);

        $thisWeek = (int) $sessions()
            ->whereBetween('studied_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('duration_minutes');
        $lastWeek = (int) $sessions()
            ->whereBetween('studied_at', [
                Carbon::now()->subWeek()->startOfWeek(),
                Carbon::now()->subWeek()->endOfWeek(),
            ])
            ->sum('duration_minutes');
        $diff = $thisWeek - $lastWeek;

        $totals = $sessions()
            ->selectRaw('COALESCE(SUM(questions_total), 0) as qt, COALESCE(SUM(questions_correct), 0) as qc')
            ->first();
        $accuracy = $totals && $totals->qt > 0 ? (int) round($totals->qc / $totals->qt * 100) : null;

        $streak = $this->studyStreak($userId, $planId);

        // Reviews: how many aren't overdue.
        $reviews = StudyTask::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId)
            ->where('type', StudyTask::TYPE_REVIEW)
            ->get(['status', 'scheduled_for']);
        $reviewsTotal = $reviews->count();
        $reviewsOverdue = $reviews
            ->where('status', 'pending')
            ->filter(fn ($t) => $t->scheduled_for->lt($today))
            ->count();
        $reviewsPct = $reviewsTotal > 0
            ? (int) round(($reviewsTotal - $reviewsOverdue) / $reviewsTotal * 100)
            : 100;

        return [
            [
                'label' => 'Horas na semana',
                'value' => $this->formatHours($thisWeek),
                'hint' => $diff === 0
                    ? 'igual à semana passada'
                    : ($diff > 0 ? '+' : '−').$this->formatHours(abs($diff)).' vs. semana passada',
            ],
            [
                'label' => 'Questões resolvidas',
                'value' => (int) ($totals->qt ?? 0),
                'hint' => $accuracy !== null ? "{$accuracy}% de acertos" : 'sem questões registradas',
            ],
            [
                'label' => 'Sequência de estudo',
                'value' => $streak.($streak === 1 ? ' dia' : ' dias'),
                'hint' => $streak > 0 ? 'Mantenha o ritmo!' : 'Estude hoje para começar',
            ],
            [
                'label' => 'Revisões em dia',
                'value' => "{$reviewsPct}%",
                'hint' => $reviewsTotal === 0
                    ? 'sem revisões ainda'
                    : ($reviewsOverdue > 0
                        ? $reviewsOverdue.($reviewsOverdue === 1 ? ' atrasada' : ' atrasadas')
                        : 'tudo em dia'),
            ],
        ];
    }

    /**
     * Accuracy per subject, lowest first (the ciclo prioritises weak subjects).
     *
     * @return array<int, array<string, mixed>>
     */
    private function accuracyBySubject(int $userId, int $planId): array
    {
        return StudySession::query()
            ->where('study_sessions.user_id', $userId)
            ->where('study_sessions.study_cycle_id', $planId)
            ->join('topics', 'study_sessions.topic_id', '=', 'topics.id')
            ->join('subjects', 'topics.subject_id', '=', 'subjects.id')
            ->groupBy('subjects.id', 'subjects.name', 'subjects.color')
            ->havingRaw('SUM(questions_total) > 0')
            ->selectRaw('subjects.name as name, subjects.color as color, SUM(questions_total) as qt, SUM(questions_correct) as qc')
            ->get()
            ->map(fn ($r) => [
                'subject' => $r->name,
                'color' => $r->color ?? '#94a3b8',
                'accuracy' => (int) round($r->qc / $r->qt * 100),
            ])
            ->sortBy('accuracy')
            ->values()
            ->all();
    }

    private function formatHours(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        if ($h && $m) {
            return "{$h}h".str_pad((string) $m, 2, '0', STR_PAD_LEFT);
        }

        return $h ? "{$h}h" : "{$m}min";
    }

    /**
     * Consecutive study days (ending today, or yesterday as grace) in this plan.
     */
    private function studyStreak(int $userId, int $planId): int
    {
        $dates = StudySession::query()
            ->where('user_id', $userId)
            ->where('study_cycle_id', $planId)
            ->pluck('studied_at')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->flip();

        if ($dates->isEmpty()) {
            return 0;
        }

        $cursor = Carbon::today();
        if (! $dates->has($cursor->toDateString())
            && $dates->has($cursor->copy()->subDay()->toDateString())) {
            $cursor = $cursor->subDay();
        }

        $streak = 0;
        while ($dates->has($cursor->toDateString())) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }
}
