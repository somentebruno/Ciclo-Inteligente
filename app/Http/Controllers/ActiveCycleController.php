<?php

namespace App\Http\Controllers;

use App\Models\StudyCycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ActiveCycleController extends Controller
{
    /**
     * Update the active cycle in the session.
     */
    public function update(Request $request, StudyCycle $cycle): RedirectResponse
    {
        // Ensure the cycle belongs to the user
        abort_unless($cycle->user_id === $request->user()->id, 403);

        $request->session()->put('active_cycle_id', $cycle->id);

        return back()->with('success', 'Plano de estudos atualizado com sucesso!');
    }
}
