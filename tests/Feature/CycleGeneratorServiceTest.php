<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\Subject;
use App\Models\User;
use App\Services\CycleGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CycleGeneratorServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_total_generated_minutes_always_matches_weekly_tasks(): void
    {
        $user = User::factory()->create();
        $course = Course::create(['name' => 'Concurso Teste', 'slug' => 'concurso-teste', 'is_active' => true]);

        // 15 subjects with near-identical weight: independent per-subject
        // round()ing used to make several of them round down at once,
        // leaking whole blocks off the total (the reported 13h15 vs 17h45
        // discrepancy).
        $subjects = [];
        for ($i = 0; $i < 15; $i++) {
            $subject = Subject::create([
                'course_id' => $course->id,
                'name' => "Materia $i",
                'slug' => "materia-$i",
            ]);
            $subjects[] = ['subject_id' => $subject->id, 'importance' => 3, 'knowledge' => 3];
        }

        $weeklyTasks = 21;
        $cycle = StudyCycle::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'name' => 'Plano teste',
            'status' => 'active',
            'weekly_tasks' => $weeklyTasks,
            'min_session_minutes' => 90,
            'max_session_minutes' => 90,
        ]);

        app(CycleGeneratorService::class)->generate($cycle, $subjects);

        $cycle->refresh();
        $this->assertSame($weeklyTasks, $cycle->items()->count());
        $this->assertSame($weeklyTasks * 90, (int) $cycle->items()->sum('planned_minutes'));

        // Every subject still gets at least one block per lap.
        foreach ($subjects as $s) {
            $this->assertGreaterThanOrEqual(
                1,
                $cycle->items()->where('subject_id', $s['subject_id'])->count()
            );
        }
    }

    public function test_every_subject_gets_a_block_even_when_weekly_tasks_is_below_subject_count(): void
    {
        $user = User::factory()->create();
        $course = Course::create(['name' => 'Concurso Teste 2', 'slug' => 'concurso-teste-2', 'is_active' => true]);

        $subjects = [];
        for ($i = 0; $i < 5; $i++) {
            $subject = Subject::create([
                'course_id' => $course->id,
                'name' => "Materia $i",
                'slug' => "materia2-$i",
            ]);
            $subjects[] = ['subject_id' => $subject->id, 'importance' => 3, 'knowledge' => 3];
        }

        // Fewer weekly tasks than subjects.
        $cycle = StudyCycle::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'name' => 'Plano teste 2',
            'status' => 'active',
            'weekly_tasks' => 3,
            'min_session_minutes' => 90,
            'max_session_minutes' => 90,
        ]);

        app(CycleGeneratorService::class)->generate($cycle, $subjects);

        $this->assertSame(5, $cycle->items()->count());
    }
}
