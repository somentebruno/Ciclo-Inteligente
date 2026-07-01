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
     * Catalog of available plans, grouped by órgão. Each cargo carries the
     * subject/topic counts of its concurso and can be opened to create a plan.
     */
    public function index(Request $request): Response
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

        $user = $this->currentUser($request);

        return Inertia::render('Planos/Index', [
            'plans' => $plans,
            // The student's current plan (if any). A new plan can only be created
            // after deleting this one.
            'currentPlan' => StudyCycle::where('user_id', $user->id)
                ->orderByDesc('id')
                ->first(['id', 'name']),
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
     * Delete the student's plan (study cycle). Cascades to its items, tasks and
     * pivots; study sessions are preserved (FK set to null). This is what frees
     * the student to create a new plan.
     */
    public function destroy(Request $request, StudyCycle $cycle): RedirectResponse
    {
        $user = $this->currentUser($request);

        abort_unless($cycle->user_id === $user->id, 403);

        // If this was the active cycle, drop the selection so shared props reset.
        if ((int) $request->session()->get('active_cycle_id') === $cycle->id) {
            $request->session()->forget('active_cycle_id');
        }

        $cycle->delete();

        return back()->with('success', 'Plano apagado. Agora você pode criar um novo.');
    }
}
