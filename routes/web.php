<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlannerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => app()->version(),
    ]);
})->name('welcome');

/*
|--------------------------------------------------------------------------
| Área autenticada
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/home', fn () => Inertia::render('Home'))->name('home');
    Route::redirect('/dashboard', '/home')->name('dashboard');

    // Onboarding — montagem do plano (6 etapas)
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Navegação principal (Sidebar)
    Route::get('/metas-do-dia', [PlannerController::class, 'metas'])->name('metas');

    Route::get('/tarefas', [TaskController::class, 'index'])->name('tarefas');
    Route::get('/tarefas/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::post('/tarefas/{task}/concluir', [TaskController::class, 'complete'])->name('tasks.complete');

    Route::get('/revisoes', [PlannerController::class, 'revisoes'])->name('revisoes');
    Route::get('/plano-semanal', [PlannerController::class, 'plano'])->name('plano-semanal');

    Route::get('/planos', [PlanController::class, 'index'])->name('planos');
    Route::get('/planos/novo', [PlanController::class, 'create'])->name('planos.create');
    Route::delete('/planos/{cycle}', [PlanController::class, 'destroy'])->name('planos.destroy');

    Route::get('/desempenho', fn () => Inertia::render('Desempenho'))->name('desempenho');

    // Perfil (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
