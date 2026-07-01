<?php

namespace Tests\Feature;

use App\Models\Cargo;
use App\Models\Course;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_plans_index_lists_created_plans_with_counts(): void
    {
        $course = Course::create([
            'name' => 'Concurso X', 'orgao' => 'IBGE', 'slug' => 'x', 'is_active' => true,
        ]);
        $subject = Subject::create(['course_id' => $course->id, 'name' => 'Port', 'slug' => 'port']);
        Topic::create(['subject_id' => $subject->id, 'name' => 'Crase', 'order' => 0]);
        Cargo::create(['course_id' => $course->id, 'name' => 'Agente (ACA)', 'code' => 'ACA']);

        $this->get('/planos')->assertOk()->assertInertia(
            fn (Assert $page) => $page
                ->component('Planos/Index')
                ->has('plans', 1)
                ->where('plans.0.orgao', 'IBGE')
                ->where('plans.0.subjects_count', 1)
                ->where('plans.0.topics_count', 1)
                ->has('plans.0.cargos', 1)
        );
    }

    public function test_create_plan_page_renders(): void
    {
        $this->get('/planos/novo')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('Planos/Novo')->has('upcoming', 0)
        );
    }
}
