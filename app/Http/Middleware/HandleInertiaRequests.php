<?php

namespace App\Http\Middleware;

use App\Concerns\ResolvesCurrentUser;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    use ResolvesCurrentUser;

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
        $user = $this->currentUser($request);

        // The plan the user is currently viewing (single source of truth) plus
        // all of their plans, so the top-bar selector can switch between them.
        $active = $this->activePlan($request);
        $plans = $user
            ? $user->studyCycles()->latest('id')->get(['id', 'name'])
            : collect();

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user
                    ? $user->only('id', 'name', 'email')
                    : null,
            ],
            'currentPlan' => $active ? $active->only('id', 'name') : null,
            'userPlans' => $plans,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
