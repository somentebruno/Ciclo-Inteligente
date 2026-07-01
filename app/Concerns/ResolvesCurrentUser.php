<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * Resolves the acting user. Falls back to the demo student while authentication
 * (Breeze) is not wired up yet.
 */
trait ResolvesCurrentUser
{
    protected function currentUser(Request $request): User
    {
        return $request->user() ?: User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );
    }
}
