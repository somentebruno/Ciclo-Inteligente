<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
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

        $subjects = [
            ['name' => 'Português', 'weight' => 8, 'difficulty' => 3, 'color' => '#3577fb'],
            ['name' => 'Direito Constitucional', 'weight' => 9, 'difficulty' => 4, 'color' => '#16a34a'],
            ['name' => 'Direito Administrativo', 'weight' => 9, 'difficulty' => 4, 'color' => '#f59e0b'],
            ['name' => 'Raciocínio Lógico', 'weight' => 6, 'difficulty' => 3, 'color' => '#8b5cf6'],
            ['name' => 'Informática', 'weight' => 5, 'difficulty' => 2, 'color' => '#0ea5e9'],
        ];

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

            // A couple of sample topics per subject.
            foreach (['Introdução', 'Aprofundamento', 'Questões'] as $i => $topicName) {
                Topic::firstOrCreate(
                    ['subject_id' => $subject->id, 'name' => "{$data['name']} — {$topicName}"],
                    ['order' => $i, 'estimated_minutes' => 45]
                );
            }
        }
    }
}
