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

        // Single source of truth: the user's one and only plan (or null).
        $plan = $user?->currentPlan();

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user
                    ? $user->only('id', 'name', 'email')
                    : null,
            ],
            'currentPlan' => $plan ? $plan->only('id', 'name') : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
