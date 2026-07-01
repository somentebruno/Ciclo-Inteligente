<?php

use App\Http\Controllers\ActiveCycleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlannerController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => app()->version(),
    ]);
})->name('welcome');

Route::get('/home', fn () => Inertia::render('Home'))->name('home');
Route::redirect('/dashboard', '/home')->name('dashboard');

Route::post('/cycles/active/{cycle}', [ActiveCycleController::class, 'update'])->name('cycles.active');

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
Route::get('/metas-do-dia', [PlannerController::class, 'metas'])->name('metas');

Route::get('/tarefas', [TaskController::class, 'index'])->name('tarefas');
Route::get('/tarefas/{task}', [TaskController::class, 'show'])->name('tasks.show');
Route::post('/tarefas/{task}/concluir', [TaskController::class, 'complete'])->name('tasks.complete');

Route::get('/revisoes', [PlannerController::class, 'revisoes'])->name('revisoes');
Route::get('/plano-semanal', [PlannerController::class, 'plano'])->name('plano-semanal');

Route::get('/planos', [PlanController::class, 'index'])->name('planos');
Route::get('/planos/novo', [PlanController::class, 'create'])->name('planos.create');
Route::get('/desempenho', fn () => Inertia::render('Desempenho'))->name('desempenho');
