<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    /**
     * List the plans (concursos) already created.
     */
    public function index(): Response
    {
        $plans = Course::query()
            ->withCount(['subjects', 'topics', 'cargos'])
            ->with('cargos:id,course_id,name,code')
            ->orderBy('name')
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'name' => $course->name,
                'orgao' => $course->orgao,
                'exam_board' => $course->exam_board,
                'subjects_count' => $course->subjects_count,
                'topics_count' => $course->topics_count,
                'cargos' => $course->cargos->map(fn ($cargo) => [
                    'id' => $cargo->id,
                    'name' => $cargo->name,
                    'code' => $cargo->code,
                ])->values(),
            ]);

        return Inertia::render('Planos/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * "Criar novo plano" page (opened in a new tab): search + personalized
     * plan + catalog of upcoming concursos (empty for now).
     */
    public function create(): Response
    {
        return Inertia::render('Planos/Novo', [
            // Catalog of upcoming concursos, grouped by órgão. Empty for now.
            'upcoming' => [],
        ]);
    }
}
