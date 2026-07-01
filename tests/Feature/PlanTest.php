<?php

namespace Tests\Feature;

use App\Models\Cargo;
use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\StudyTask;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlanTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    private function makeCycle(?User $owner = null): StudyCycle
    {
        $owner ??= $this->user;
        $course = Course::create(['name' => 'C', 'slug' => 'c-'.uniqid(), 'is_active' => true]);

        return StudyCycle::create([
            'user_id' => $owner->id,
            'course_id' => $course->id,
            'name' => 'Plano — Agente',
            'weekly_tasks' => 7,
            'status' => 'active',
        ]);
    }

    public function test_plans_index_groups_cargos_by_orgao_with_counts(): void
    {
        $course = Course::create([
            'name' => 'Concurso X', 'orgao' => 'IBGE', 'slug' => 'x', 'is_active' => true,
        ]);
        $subject = Subject::create(['course_id' => $course->id, 'name' => 'Port', 'slug' => 'port']);
        Topic::create(['subject_id' => $subject->id, 'name' => 'Crase', 'order' => 0]);
        Cargo::create(['course_id' => $course->id, 'name' => 'Agente', 'code' => 'ACA']);

        $this->get('/planos')->assertOk()->assertInertia(
            fn (Assert $page) => $page
                ->component('Planos/Index')
                ->has('plans', 1)
                ->where('plans.0.orgao', 'IBGE')
                ->where('plans.0.title', 'IBGE — Temporário 2026 (Pós-edital)')
                ->has('plans.0.cargos', 1)
                ->where('plans.0.cargos.0.subjects_count', 1)
                ->where('plans.0.cargos.0.topics_count', 1)
                ->where('plans.0.cargos.0.course_id', $course->id)
        );
    }

    public function test_create_plan_page_renders(): void
    {
        $this->get('/planos/novo')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('Planos/Novo')->has('upcoming', 0)
        );
    }

    public function test_index_exposes_the_current_plan(): void
    {
        // No plan yet.
        $this->get('/planos')->assertInertia(
            fn (Assert $page) => $page->where('currentPlan', null)
        );

        $cycle = $this->makeCycle();

        $this->get('/planos')->assertInertia(
            fn (Assert $page) => $page
                ->where('currentPlan.id', $cycle->id)
                ->where('currentPlan.name', 'Plano — Agente')
        );
    }

    public function test_destroy_deletes_the_plan_and_its_tasks(): void
    {
        $cycle = $this->makeCycle();
        $subject = Subject::create(['course_id' => $cycle->course_id, 'name' => 'Port', 'slug' => 'p']);
        StudyTask::create([
            'user_id' => $this->user->id,
            'study_cycle_id' => $cycle->id,
            'subject_id' => $subject->id,
            'title' => 'Aula',
            'type' => 'theory',
            'format' => 'pdf',
            'planned_minutes' => 90,
            'scheduled_for' => now()->toDateString(),
            'position' => 0,
            'status' => 'pending',
        ]);

        $this->delete("/planos/{$cycle->id}")->assertRedirect();

        $this->assertDatabaseMissing('study_cycles', ['id' => $cycle->id]);
        $this->assertDatabaseMissing('study_tasks', ['study_cycle_id' => $cycle->id]);
    }

    public function test_cannot_delete_another_users_plan(): void
    {
        $cycle = $this->makeCycle(User::factory()->create());

        $this->delete("/planos/{$cycle->id}")->assertForbidden();

        $this->assertDatabaseHas('study_cycles', ['id' => $cycle->id]);
    }
}
