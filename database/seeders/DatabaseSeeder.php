<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Course;
use App\Models\StudyCycle;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use App\Services\CycleGeneratorService;
use App\Services\TaskSchedulerService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );

        $course = Course::firstOrCreate(
            ['slug' => 'concurso-tribunais-2026'],
            [
                'name' => 'Concurso Tribunais 2026',
                'description' => 'Curso preparatório para carreiras de tribunais.',
                'exam_board' => 'FGV',
                'is_active' => true,
            ]
        );
        $course->forceFill(['orgao' => 'Tribunais Regionais'])->save();

        foreach ([
            ['name' => 'Analista Judiciário — Área Judiciária', 'code' => 'AJAJ'],
            ['name' => 'Técnico Judiciário — Área Administrativa', 'code' => 'TJAA'],
        ] as $cargo) {
            Cargo::firstOrCreate(
                ['course_id' => $course->id, 'name' => $cargo['name']],
                ['code' => $cargo['code']]
            );
        }

        $subjects = [
            ['name' => 'Português', 'weight' => 8, 'difficulty' => 3, 'color' => '#3577fb'],
            ['name' => 'Direito Constitucional', 'weight' => 9, 'difficulty' => 4, 'color' => '#16a34a'],
            ['name' => 'Direito Administrativo', 'weight' => 9, 'difficulty' => 4, 'color' => '#f59e0b'],
            ['name' => 'Raciocínio Lógico', 'weight' => 6, 'difficulty' => 3, 'color' => '#8b5cf6'],
            ['name' => 'Informática', 'weight' => 5, 'difficulty' => 2, 'color' => '#0ea5e9'],
        ];

        $createdSubjects = [];

        foreach ($subjects as $data) {
            $subject = Subject::firstOrCreate(
                ['course_id' => $course->id, 'slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'weight' => $data['weight'],
                    'difficulty' => $data['difficulty'],
                    'color' => $data['color'],
                ]
            );
            $createdSubjects[] = $subject;

            // A couple of sample topics per subject.
            foreach (['Introdução', 'Aprofundamento', 'Questões'] as $i => $topicName) {
                Topic::firstOrCreate(
                    ['subject_id' => $subject->id, 'name' => "{$data['name']} — {$topicName}"],
                    ['order' => $i, 'estimated_minutes' => 45]
                );
            }
        }

        // Demo study cycle so the task queue is populated out of the box.
        if (! StudyCycle::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
            $cycle = StudyCycle::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'name' => 'Plano — '.$course->name,
                'weekly_tasks' => 14,
                'daily_tasks' => 2,
                'weekly_hours' => 21,
                'status' => 'active',
                'generated_at' => now(),
                'onboarding_completed_at' => now(),
            ]);

            $difficultyMap = [4 => 'dificil', 3 => 'medio', 2 => 'facil'];
            $subjectsInput = [];
            $pivot = [];
            foreach ($createdSubjects as $subject) {
                $difficulty = $difficultyMap[$subject->difficulty] ?? 'medio';
                $format = $subject->difficulty >= 4 ? 'video' : 'pdf';
                $subjectsInput[] = [
                    'subject_id' => $subject->id,
                    'difficulty' => $difficulty,
                    'format' => $format,
                ];
                $pivot[$subject->id] = ['difficulty' => $difficulty, 'format' => $format];
            }

            $cycle->configuredSubjects()->sync($pivot);
            app(CycleGeneratorService::class)->generate($cycle, $subjectsInput);
            app(TaskSchedulerService::class)->schedule($cycle);
        }
    }
}
