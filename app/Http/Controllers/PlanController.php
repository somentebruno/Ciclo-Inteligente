<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesCurrentUser;
use App\Models\Course;
use App\Models\StudyCycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    use ResolvesCurrentUser;

    /** Título do card de catálogo por órgão. */
    private const CATALOG_TITLES = [
        'IBGE' => 'IBGE — Temporário 2026 (Pós-edital)',
    ];

    /**
     * The student's plans + the catalog of available concursos, grouped by órgão.
     * One plan per cargo: cargos whose course already has a plan are flagged so
     * the UI can offer to delete it instead of creating a duplicate.
     */
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->withCount(['subjects', 'topics'])
            ->with('cargos:id,course_id,name,code')
            ->orderBy('name')
            ->get();

        $catalog = $courses
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

        $user = $this->currentUser($request);
        $activeId = $this->activePlan($request)?->id;

        $myPlans = $user->studyCycles()
            ->latest('id')
            ->get(['id', 'name', 'course_id'])
            ->map(fn (StudyCycle $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'course_id' => $c->course_id,
                'is_active' => $c->id === $activeId,
            ]);

        return Inertia::render('Planos/Index', [
            'catalog' => $catalog,
            'myPlans' => $myPlans,
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

    /**
     * Make the given plan the one the user is currently viewing.
     */
    public function activate(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $request->session()->put('active_cycle_id', $cycle->id);

        return back()->with('success', 'Plano ativo atualizado.');
    }

    /**
     * Delete one of the student's plans (study cycle). Cascades to its items,
     * tasks and pivots; study sessions are preserved (FK set to null). This is
     * what frees the cargo so a new plan can be created for it.
     */
    public function destroy(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        $cycle->delete();

        return back()->with('success', 'Plano apagado.');
    }
}
