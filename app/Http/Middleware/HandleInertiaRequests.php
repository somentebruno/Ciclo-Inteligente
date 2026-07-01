<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default to every page.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $cycles = [];
        $activeCycle = null;

        if ($user) {
            $cycles = \App\Models\StudyCycle::where('user_id', $user->id)
                        ->select('id', 'name')
                        ->get();

            $activeCycleId = $request->session()->get('active_cycle_id');
            
            // If there's no active cycle in session but the user has cycles, pick the latest one
            if (! $activeCycleId && $cycles->isNotEmpty()) {
                $activeCycleId = $cycles->last()->id;
                $request->session()->put('active_cycle_id', $activeCycleId);
            }

            if ($activeCycleId) {
                $activeCycle = $cycles->firstWhere('id', $activeCycleId) ?? $cycles->last();
            }
        }

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user
                    ? $user->only('id', 'name', 'email')
                    : null,
            ],
            'globalPlans' => [
                'cycles' => $cycles,
                'activeCycle' => $activeCycle,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
