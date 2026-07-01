<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * Resolves the currently authenticated user. App routes are behind the `auth`
 * middleware, so within them this is guaranteed to be non-null; on shared props
 * (guest pages) it may be null.
 */
trait ResolvesCurrentUser
{
    protected function currentUser(Request $request): ?User
    {
        return $request->user();
    }
}
