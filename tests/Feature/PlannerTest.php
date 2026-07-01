<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\StudyTask;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlannerTest extends TestCase
{
    use RefreshDatabase;

    private function seedTasks(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );
        $course = Course::create(['name' => 'C', 'slug' => 'c', 'is_active' => true]);
        $subject = Subject::create(['course_id' => $course->id, 'name' => 'Port', 'slug' => 'port', 'color' => '#3577fb']);
        $cycle = StudyCycle::create([
            'user_id' => $user->id, 'course_id' => $course->id, 'name' => 'Plano', 'weekly_tasks' => 7,
            'weekly_hours' => 11, 'status' => 'active',
        ]);

        $base = [
            'user_id' => $user->id, 'study_cycle_id' => $cycle->id, 'subject_id' => $subject->id,
            'format' => 'pdf', 'planned_minutes' => 90, 'position' => 0, 'status' => 'pending',
        ];

        StudyTask::create($base + ['title' => 'Aula hoje', 'type' => 'theory', 'scheduled_for' => now()->toDateString()]);
        StudyTask::create($base + ['title' => 'Revisar', 'type' => 'review', 'scheduled_for' => now()->toDateString(), 'planned_minutes' => 45]);
    }

    public function test_metas_do_dia_lists_today_tasks(): void
    {
        $this->seedTasks();

        $this->get('/metas-do-dia')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('MetasDoDia')->has('metas', 2)
        );
    }

    public function test_revisoes_lists_review_tasks(): void
    {
        $this->seedTasks();

        $this->get('/revisoes')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('Revisoes')->has('reviews', 1)->where('dueToday', 1)
        );
    }

    public function test_plano_semanal_lays_out_seven_days(): void
    {
        $this->seedTasks();

        $this->get('/plano-semanal')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('PlanoSemanal')->has('days', 7)
        );
    }
}
