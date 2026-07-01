<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => app()->version(),
    ]);
})->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Onboarding — montagem do plano (6 etapas)
|--------------------------------------------------------------------------
*/
Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

/*
|--------------------------------------------------------------------------
| Área do aluno — navegação principal (Sidebar)
|--------------------------------------------------------------------------
*/
Route::get('/metas-do-dia', fn () => Inertia::render('MetasDoDia'))->name('metas');

Route::get('/tarefas', [TaskController::class, 'index'])->name('tarefas');
Route::get('/tarefas/{task}', [TaskController::class, 'show'])->name('tasks.show');
Route::post('/tarefas/{task}/concluir', [TaskController::class, 'complete'])->name('tasks.complete');

Route::get('/revisoes', fn () => Inertia::render('Revisoes'))->name('revisoes');
Route::get('/plano-semanal', fn () => Inertia::render('PlanoSemanal'))->name('plano-semanal');
Route::get('/desempenho', fn () => Inertia::render('Desempenho'))->name('desempenho');
