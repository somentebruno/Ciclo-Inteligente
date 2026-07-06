<?php

use App\Http\Controllers\DesempenhoController;
use App\Http\Controllers\DisciplinasController;
use App\Http\Controllers\EditalVerticalizadoController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanejamentoController;
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
    Route::get('/home', [HomeController::class, 'index'])->name('home');
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

    // Planejamento — ciclo de estudos
    Route::get('/planejamento', [PlanejamentoController::class, 'index'])->name('planejamento');
    Route::post('/planejamento/recomecar', [PlanejamentoController::class, 'restart'])->name('planejamento.restart');
    Route::post('/planejamento/replanejar', [PlanejamentoController::class, 'replan'])->name('planejamento.replan');
    Route::post('/planejamento/sessoes', [PlanejamentoController::class, 'storeManualSession'])->name('planejamento.sessoes.store');
    Route::post('/planejamento/itens', [PlanejamentoController::class, 'storeItem'])->name('planejamento.itens.store');
    Route::post('/planejamento/itens/reordenar', [PlanejamentoController::class, 'reorderItems'])->name('planejamento.itens.reordenar');
    Route::patch('/planejamento/itens/{item}', [PlanejamentoController::class, 'updateItem'])->name('planejamento.itens.update');
    Route::post('/planejamento/itens/{item}/duplicar', [PlanejamentoController::class, 'duplicateItem'])->name('planejamento.itens.duplicar');
    Route::delete('/planejamento/itens/{item}', [PlanejamentoController::class, 'destroyItem'])->name('planejamento.itens.destroy');

    Route::get('/planos', [PlanController::class, 'index'])->name('planos');
    Route::get('/planos/novo', [PlanController::class, 'create'])->name('planos.create');
    Route::post('/planos/{cycle}/ativar', [PlanController::class, 'activate'])->name('planos.activate');
    Route::delete('/planos/{cycle}', [PlanController::class, 'destroy'])->name('planos.destroy');

    Route::get('/desempenho', [DesempenhoController::class, 'index'])->name('desempenho');

    Route::get('/disciplinas', [DisciplinasController::class, 'index'])->name('disciplinas');

    Route::get('/edital-verticalizado', [EditalVerticalizadoController::class, 'index'])->name('edital-verticalizado');
    Route::post('/edital-verticalizado/topicos/{topic}/alternar', [EditalVerticalizadoController::class, 'toggleTopic'])->name('edital-verticalizado.topicos.alternar');

    // Perfil (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
