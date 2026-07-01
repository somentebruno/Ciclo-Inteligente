<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    /** Título do card de catálogo por órgão. */
    private const CATALOG_TITLES = [
        'IBGE' => 'IBGE — Temporário 2026 (Pós-edital)',
    ];

    /**
     * Catalog of available plans, grouped by órgão. Each cargo carries the
     * subject/topic counts of its concurso and can be opened to create a plan.
     */
    public function index(): Response
    {
        $courses = Course::query()
            ->withCount(['subjects', 'topics'])
            ->with('cargos:id,course_id,name,code')
            ->orderBy('name')
            ->get();

        $plans = $courses
            ->groupBy(fn (Course $course) => $course->orgao ?? 'Outros')
            ->map(fn ($group, $orgao) => [
                'orgao' => $orgao,
                'title' => self::CATALOG_TITLES[$orgao] ?? $orgao,
                'cargos' => $group->flatMap(fn (Course $course) => $course->cargos->map(fn ($cargo) => [
                    'id' => $cargo->id,
                    'course_id' => $course->id,
                    'name' => $cargo->name,
                    'code' => $cargo->code,
                    'subjects_count' => $course->subjects_count,
                    'topics_count' => $course->topics_count,
                ]))->values(),
            ])
            ->values();

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
