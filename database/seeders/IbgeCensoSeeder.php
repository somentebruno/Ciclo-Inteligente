<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Course;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Processo seletivo IBGE — 12º Censo Agropecuário, Florestal e Aquícola.
 * Cargo: Agente Censitário de Qualidade (ACQ).
 */
class IbgeCensoSeeder extends Seeder
{
    public function run(): void
    {
        $course = Course::firstOrCreate(
            ['slug' => 'ibge-censo-agropecuario-2026'],
            [
                'name' => 'IBGE — Censo Agropecuário 2026',
                'orgao' => 'IBGE',
                'description' => 'Processo seletivo simplificado do IBGE para o 12º Censo Agropecuário, Florestal e Aquícola.',
                'is_active' => true,
            ]
        );

        Cargo::firstOrCreate(
            ['course_id' => $course->id, 'name' => 'Agente Censitário de Qualidade'],
            ['code' => 'ACQ']
        );

        $disciplinas = [
            [
                'name' => 'Língua Portuguesa',
                'weight' => 8,
                'difficulty' => 3,
                'color' => '#3577fb',
                'topics' => [
                    'Compreensão e interpretação de texto.',
                    'Significação das palavras: sinônimos, antônimos, homônimos e parônimos.',
                    'Pontuação. Estrutura e sequência lógica de frases e parágrafos.',
                    'Ortografia oficial. Acentuação gráfica.',
                    'Classes das palavras.',
                    'Concordância nominal e verbal.',
                    'Regência nominal e verbal.',
                    'Emprego dos verbos regulares, irregulares e anômalos. Vozes dos verbos.',
                    'Emprego dos pronomes.',
                    'Sintaxe: termos essenciais, integrantes e acessórios da oração.',
                    'Coesão e coerência (referenciação, substituição, repetição, conectores; tempos e modos verbais).',
                    'Redação e reescrita de comunicados, ofícios e registros operacionais (clareza, objetividade, padrão formal).',
                ],
            ],
            [
                'name' => 'Raciocínio Lógico Quantitativo',
                'weight' => 6,
                'difficulty' => 3,
                'color' => '#8b5cf6',
                'topics' => [
                    'Avaliação da habilidade do candidato em entender a estrutura lógica de relações entre pessoas, lugares, coisas e/ou eventos, deduzir novas informações e avaliar as condições usadas para estabelecer a estrutura dessas relações.',
                    'Áreas das questões: I - estruturas lógicas; II - lógica de argumentação; III - diagramas lógicos; IV - aritmética; V - álgebra e geometria básicas.',
                ],
            ],
            [
                'name' => 'Geografia',
                'weight' => 6,
                'difficulty' => 3,
                'color' => '#16a34a',
                'topics' => [
                    'Noções básicas de cartografia.',
                    'Localização: coordenadas geográficas, latitude, longitude e altitude.',
                    'Representação: leitura, escala, legendas e convenções.',
                    'Organização do espaço agrário: atividades econômicas, modernização tecnológica e conflitos.',
                    'Questões de sucessão familiar no espaço rural.',
                    'Estrutura fundiária brasileira.',
                    'Práticas agrícolas, armazenamento da produção.',
                    'Organização espacial da agricultura, da pecuária e do extrativismo no Brasil.',
                    'Questões ambientais no campo brasileiro.',
                    'Povos e comunidades tradicionais no Brasil.',
                    'Formação territorial e divisão político-administrativa (organização federativa).',
                ],
            ],
            [
                'name' => 'Conhecimentos Técnicos',
                'weight' => 7,
                'difficulty' => 4,
                'color' => '#f59e0b',
                'topics' => [
                    'Conteúdo do documento "Estudo dos conhecimentos técnicos a serem aplicados no 12º Censo Agropecuário, Florestal e Aquícola".',
                ],
            ],
        ];

        foreach ($disciplinas as $data) {
            $subject = Subject::firstOrCreate(
                ['course_id' => $course->id, 'slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'weight' => $data['weight'],
                    'difficulty' => $data['difficulty'],
                    'color' => $data['color'],
                ]
            );

            foreach ($data['topics'] as $i => $topicName) {
                Topic::firstOrCreate(
                    ['subject_id' => $subject->id, 'name' => $topicName],
                    ['order' => $i, 'estimated_minutes' => 45]
                );
            }
        }
    }
}
