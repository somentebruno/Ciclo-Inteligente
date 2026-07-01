<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\StudySession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show an overview of courses, cycles and recent study activity.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'courses' => Course::count(),
                'cycles' => StudyCycle::count(),
                'sessions' => StudySession::count(),
                'minutesStudied' => (int) StudySession::sum('duration_minutes'),
            ],
            'courses' => Course::query()
                ->withCount('subjects')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'exam_board', 'is_active']),
        ]);
    }
}
