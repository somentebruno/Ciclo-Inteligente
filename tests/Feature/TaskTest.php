<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\StudyTask;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private function makeTask(): StudyTask
    {
        // The controller falls back to this demo user when unauthenticated.
        $user = User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );

        $course = Course::create(['name' => 'C', 'slug' => 'c', 'is_active' => true]);
        $subject = Subject::create(['course_id' => $course->id, 'name' => 'Port', 'slug' => 'port']);
        $topic = Topic::create(['subject_id' => $subject->id, 'name' => 'Crase', 'order' => 0]);
        $cycle = StudyCycle::create([
            'user_id' => $user->id, 'course_id' => $course->id, 'name' => 'Plano', 'weekly_tasks' => 7,
        ]);

        return StudyTask::create([
            'user_id' => $user->id,
            'study_cycle_id' => $cycle->id,
            'subject_id' => $subject->id,
            'topic_id' => $topic->id,
            'title' => 'Crase',
            'type' => 'theory',
            'format' => 'pdf',
            'planned_minutes' => 90,
            'scheduled_for' => now()->toDateString(),
            'position' => 0,
            'status' => 'pending',
        ]);
    }

    public function test_queue_page_renders(): void
    {
        $this->get('/tarefas')->assertOk();
    }

    public function test_task_details_page_renders(): void
    {
        $task = $this->makeTask();
        $this->get("/tarefas/{$task->id}")->assertOk();
    }

    public function test_completing_a_task_marks_it_done_and_logs_a_session(): void
    {
        $task = $this->makeTask();

        $this->post("/tarefas/{$task->id}/concluir", ['duration_seconds' => 3600])
            ->assertRedirect();

        $this->assertDatabaseHas('study_tasks', [
            'id' => $task->id,
            'status' => 'done',
            'duration_seconds' => 3600,
        ]);

        $this->assertDatabaseHas('study_sessions', [
            'study_cycle_id' => $task->study_cycle_id,
            'topic_id' => $task->topic_id,
            'duration_minutes' => 60,
        ]);
    }
}
