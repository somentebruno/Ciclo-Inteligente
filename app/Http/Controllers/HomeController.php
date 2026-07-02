<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\StudyTask;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    use ResolvesCurrentUser;

    /**
     * Landing screen with the greeting and today's focus bar.
     */
    public function index(Request $request): Response
    {
        $user = $this->currentUser($request);
        $today = Carbon::today();

        $planId = $this->activePlan($request)?->id;

        $todayTasks = StudyTask::query()
            ->where('user_id', $user->id)
            ->when($planId, fn ($q) => $q->where('study_cycle_id', $planId))
            ->whereDate('scheduled_for', $today)
            ->get(['id', 'status']);

        $goal = $todayTasks->count();
        $completed = $todayTasks->where('status', 'done')->count();

        return Inertia::render('Home', [
            'focus' => [
                'goal' => $goal,
                'completed' => $completed,
                'done' => $goal > 0 && $completed >= $goal,
            ],
        ]);
    }
}
