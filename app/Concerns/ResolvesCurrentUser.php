<?php

namespace App\Concerns;

use App\Models\StudyCycle;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Resolves the currently authenticated user and the plan they're currently
 * viewing. App routes are behind the `auth` middleware, so within them the user
 * is guaranteed to be non-null; on shared props (guest pages) it may be null.
 */
trait ResolvesCurrentUser
{
    protected function currentUser(Request $request): ?User
    {
        return $request->user();
    }

    /**
     * The plan (study cycle) the user is currently viewing. A user may have one
     * plan per cargo/course; this single resolver — used by the shared props and
     * every data controller — is THE source of truth for "the active plan", so
     * every screen agrees on which one it is.
     *
     * The selection is stored in the session. If it's missing or points to a
     * plan that no longer exists (e.g. it was deleted), it falls back to the most
     * recent plan and self-heals the session.
     */
    protected function activePlan(Request $request): ?StudyCycle
    {
        $user = $this->currentUser($request);

        if (! $user) {
            return null;
        }

        $activeId = $request->session()->get('active_cycle_id');

        $active = $activeId
            ? $user->studyCycles()->whereKey($activeId)->first()
            : null;

        if (! $active) {
            $active = $user->studyCycles()->latest('id')->first();

            if ($active) {
                $request->session()->put('active_cycle_id', $active->id);
            } else {
                $request->session()->forget('active_cycle_id');
            }
        }

        return $active;
    }
}
