<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_wizard_page_renders(): void
    {
        $this->get('/onboarding')->assertOk();
    }

    public function test_store_creates_cycle_config_and_plan(): void
    {
        $course = Course::create([
            'name' => 'Concurso Teste',
            'slug' => 'concurso-teste',
            'exam_board' => 'FGV',
            'is_active' => true,
        ]);

        $port = Subject::create([
            'course_id' => $course->id, 'name' => 'Português', 'slug' => 'portugues', 'weight' => 5, 'difficulty' => 3,
        ]);
        $info = Subject::create([
            'course_id' => $course->id, 'name' => 'Informática', 'slug' => 'informatica', 'weight' => 3, 'difficulty' => 2,
        ]);

        $crase = Topic::create([
            'subject_id' => $port->id, 'name' => 'Crase', 'order' => 0, 'estimated_minutes' => 30,
        ]);

        $response = $this->post('/onboarding', [
            'course_id' => $course->id,
            'weekly_tasks' => 14,
            'daily_tasks' => 2,
            'subjects' => [
                ['subject_id' => $port->id, 'difficulty' => 'dificil', 'format' => 'pdf'],
                ['subject_id' => $info->id, 'difficulty' => 'facil', 'format' => 'video'],
            ],
            'studied_topics' => [$crase->id],
        ]);

        $response->assertRedirect(route('plano-semanal'));

        $this->assertDatabaseHas('study_cycles', [
            'course_id' => $course->id,
            'weekly_tasks' => 14,
            'daily_tasks' => 2,
            'weekly_hours' => 21,
            'status' => 'active',
        ]);

        $cycle = StudyCycle::firstOrFail();

        // Plan generated: one block per subject, harder subject comes first.
        $this->assertCount(2, $cycle->items);
        $this->assertSame($port->id, $cycle->items->first()->subject_id);

        // Per-subject config persisted.
        $this->assertDatabaseHas('cycle_subject', [
            'study_cycle_id' => $cycle->id,
            'subject_id' => $port->id,
            'difficulty' => 'dificil',
            'format' => 'pdf',
        ]);

        // Studied topic persisted (removed from the queue).
        $this->assertDatabaseHas('cycle_topic', [
            'study_cycle_id' => $cycle->id,
            'topic_id' => $crase->id,
            'already_studied' => true,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->post('/onboarding', [])->assertSessionHasErrors(['course_id', 'weekly_tasks', 'subjects']);
    }
}
