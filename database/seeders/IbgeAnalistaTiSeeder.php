<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Course;
use App\Models\Aula;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Processo seletivo IBGE — Analista Censitário (AC),
 * Desenvolvimento de Tecnologia da Informação.
 */
class IbgeAnalistaTiSeeder extends Seeder
{
    public function run(): void
    {
        $course = Course::firstOrCreate(
            ['slug' => 'ibge-analista-censitario-ti-2026'],
            [
                'name' => 'IBGE — Analista Censitário (AC) — Desenvolvimento de TI',
                'orgao' => 'IBGE',
                'description' => 'Processo seletivo IBGE — Analista Censitário (AC), Desenvolvimento de Tecnologia da Informação.',
                'is_active' => true,
            ]
        );

        Cargo::firstOrCreate(
            ['course_id' => $course->id, 'name' => 'Analista Censitário — Desenvolvimento de Tecnologia da Informação'],
            ['code' => 'AC']
        );

        $disciplinas = [
            [
                'name' => 'Língua Portuguesa',
                'weight' => 6,
                'difficulty' => 3,
                'color' => '#3577fb',
                // PLACEHOLDER: restored from the pre-migration edital text
                // (git show 5f8c379^). Replace with the official edital
                // breakdown (topics + subtopics, ~171 items for the biggest
                // subject) when available.
                'topics' => [
                    'Compreensão e interpretação de texto.',
                    'Significação das palavras: sinônimos, antônimos, homônimos e parônimos.',
                    'Pontuação.',
                    'Estrutura e sequência lógica de frases e parágrafos.',
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
                // Real aulas from the student's prep-course platform (name +
                // duration) — an attachable study resource, independent of
                // the edital topic list above. Grouped by the edital block
                // ("Tópico") they come from, then flattened into one ordered
                // list — aulas aren't tied to any specific topic.
                'aulas' => [
                    // Tópico 1 — arts. 3–9 (pontuação, ortografia, morfologia,
                    // sintaxe, verbos).
                    ['name' => 'Ortografia e Acentuação', 'minutes' => 24],
                    ['name' => 'Ortografia e Acentuação II', 'minutes' => 30],
                    ['name' => 'Ortografia e Acentuação III', 'minutes' => 23],
                    ['name' => 'Ortografia e Acentuação - Exercícios', 'minutes' => 32],
                    ['name' => 'Ortografia e Acentuação IV', 'minutes' => 26],
                    ['name' => 'Ortografia e Acentuação V', 'minutes' => 31],
                    ['name' => 'Morfologia', 'minutes' => 35],
                    ['name' => 'Morfologia II', 'minutes' => 26],
                    ['name' => 'Morfologia III', 'minutes' => 28],
                    ['name' => 'Morfologia IV', 'minutes' => 28],
                    ['name' => 'Morfologia V', 'minutes' => 29],
                    ['name' => 'Morfologia - Exercícios', 'minutes' => 39],
                    ['name' => 'Sintaxe do Período Simples', 'minutes' => 28],
                    ['name' => 'Sintaxe - Sujeito', 'minutes' => 31],
                    ['name' => 'Sintaxe - Sujeito II', 'minutes' => 24],
                    ['name' => 'Sintaxe - Sujeito III', 'minutes' => 38],
                    ['name' => 'Sintaxe - Sujeito IV', 'minutes' => 31],
                    ['name' => 'Sintaxe - Sujeito Exercícios', 'minutes' => 16],
                    ['name' => 'Predicação Verbal', 'minutes' => 34],
                    ['name' => 'Predicação Verbal II', 'minutes' => 32],
                    ['name' => 'Predicação Verbal III', 'minutes' => 39],
                    ['name' => 'Predicação Verbal - Exercícios', 'minutes' => 45],
                    ['name' => 'Termos Ligados ao Nome', 'minutes' => 44],
                    ['name' => 'Termos Ligados ao Nome II', 'minutes' => 48],
                    ['name' => 'Termos Ligados Ao Nome - Exercícios', 'minutes' => 32],
                    ['name' => 'Demais Funções Sintáticas do P.S.', 'minutes' => 16],
                    ['name' => 'Introdução Ao Período Composto', 'minutes' => 27],
                    ['name' => 'Orações Subordinadas Substantivas', 'minutes' => 29],
                    ['name' => 'Orações Subordinadas Substantivas II', 'minutes' => 26],
                    ['name' => 'Orações Subordinadas Substantivas - Exercícios', 'minutes' => 27],
                    ['name' => 'Orações Subordinadas Adjetivas', 'minutes' => 40],
                    ['name' => 'Orações Subordinadas Adjetivas II', 'minutes' => 33],
                    ['name' => 'Orações Subordinadas Adjetivas III', 'minutes' => 28],
                    ['name' => 'Orações Subordinadas Adjetivas IV', 'minutes' => 24],
                    ['name' => 'Orações Subordinadas Adjetivas V', 'minutes' => 19],
                    ['name' => 'Orações Subordinadas Adjetivas - Exercícios', 'minutes' => 50],
                    ['name' => 'Orações Subordinadas Adverbiais', 'minutes' => 35],
                    ['name' => 'Orações Coordenadas', 'minutes' => 27],
                    ['name' => 'Orações Subordinadas Adverbiais e Orações Coordenadas - Exercícios', 'minutes' => 36],
                    ['name' => 'Orações Reduzidas e Justapostas', 'minutes' => 36],
                    ['name' => 'Orações Reduzidas e Justapostas II', 'minutes' => 51],
                    ['name' => 'Pontuação', 'minutes' => 35],
                    ['name' => 'Pontuação II', 'minutes' => 33],
                    ['name' => 'Pontuação III', 'minutes' => 44],
                    ['name' => 'Pontuação IV', 'minutes' => 36],
                    ['name' => 'Pontuação V', 'minutes' => 22],
                    ['name' => 'Pontuação - Exercícios', 'minutes' => 36],
                    ['name' => 'Pontuação - Exercícios II', 'minutes' => 26],
                    ['name' => 'Pronomes Pessoais', 'minutes' => 31],
                    ['name' => 'Pronomes Pessoais II', 'minutes' => 34],
                    ['name' => 'Colocação Pronominal', 'minutes' => 35],
                    ['name' => 'Colocação Pronominal II', 'minutes' => 32],
                    ['name' => 'Pronomes Pessoais e Colocação Pronominal - Exercícios', 'minutes' => 31],
                    ['name' => 'Vozes Verbais e SE', 'minutes' => 31],
                    ['name' => 'Vozes Verbais e SE II', 'minutes' => 34],
                    ['name' => 'Vozes Verbais e SE III', 'minutes' => 35],
                    ['name' => 'Vozes Verbais e SE - Exercícios', 'minutes' => 35],
                    ['name' => 'Crase', 'minutes' => 22],
                    ['name' => 'Crase II', 'minutes' => 45],
                    ['name' => 'Crase III', 'minutes' => 19],
                    ['name' => 'Crase - Exercícios', 'minutes' => 30],
                    ['name' => 'Crase - Exercícios II', 'minutes' => 31],
                    ['name' => 'Casos Especiais de Concordância Nominal e Verbal', 'minutes' => 48],
                    ['name' => 'Casos Especiais de Concordância Nominal e Verbal II', 'minutes' => 47],
                    ['name' => 'Verbos - Conceitos Gerais', 'minutes' => 28],
                    ['name' => 'Verbos - Conceitos Gerais II', 'minutes' => 26],
                    ['name' => 'Conjugação dos Verbos Regulares', 'minutes' => 23],
                    ['name' => 'Conjugação dos Verbos Regulares II', 'minutes' => 22],
                    ['name' => 'Conjugação dos Verbos Irregulares', 'minutes' => 27],
                    ['name' => 'Tempos Compostos e Particípios', 'minutes' => 24],
                    ['name' => 'Empregos dos Tempos em Modos Verbais', 'minutes' => 20],
                    ['name' => 'Correlação dos Tempos em Modos Verbais', 'minutes' => 19],
                    ['name' => 'Verbos - Exercícios', 'minutes' => 27],
                    ['name' => 'Verbos - Exercícios II', 'minutes' => 15],

                    // Tópico 2 — arts. 1, 2 e 12 (interpretação, semântica, coesão).
                    ['name' => 'Reconhecimento de Tipos e Gêneros Textuais I', 'minutes' => 28],
                    ['name' => 'Reconhecimento de Tipos e Gêneros Textuais II', 'minutes' => 30],
                    ['name' => 'Reconhecimento de Tipos e Gêneros Textuais III', 'minutes' => 30],
                    ['name' => 'Reconhecimento de Tipos e Gêneros Textuais IV', 'minutes' => 28],
                    ['name' => 'Significação de Palavras', 'minutes' => 29],
                    ['name' => 'Significação de Palavras II', 'minutes' => 30],
                    ['name' => 'Mecanismos de Coesão Textual', 'minutes' => 30],
                    ['name' => 'Mecanismos de Coesão Textual II', 'minutes' => 29],
                    ['name' => 'Mecanismos de Coesão Textual III', 'minutes' => 30],
                    ['name' => 'Mecanismos de Coesão Textual IV', 'minutes' => 30],
                    ['name' => 'Mecanismos de Coesão Textual V', 'minutes' => 28],
                    ['name' => 'Mecanismos de Coesão Textual VI', 'minutes' => 31],

                    // Tópico 3 — art. 13 (redação oficial).
                    ['name' => 'Panorama e Conceito', 'minutes' => 33],
                    ['name' => 'Atributos da Redação Oficial', 'minutes' => 29],
                    ['name' => 'Atributos da Redação Oficial II', 'minutes' => 26],
                    ['name' => 'Atributos da Redação Oficial III', 'minutes' => 31],
                    ['name' => 'Emprego dos Pronomes de Tratamento', 'minutes' => 39],
                    ['name' => 'Correspondências Oficiais - O Padrão Ofício', 'minutes' => 30],
                    ['name' => 'O Padrão Ofício: Partes do Documento', 'minutes' => 32],
                    ['name' => 'O Padrão Ofício: Partes do Documento II', 'minutes' => 36],
                    ['name' => 'Exposição de Motivos', 'minutes' => 27],
                    ['name' => 'Mensagem', 'minutes' => 27],
                    ['name' => 'Correio Eletrônico', 'minutes' => 32],
                    ['name' => 'Exercícios Gerais', 'minutes' => 33],
                ],
            ],
            [
                'name' => 'Raciocínio Lógico Quantitativo',
                'weight' => 5,
                'difficulty' => 3,
                'color' => '#8b5cf6',
                // PLACEHOLDER: restored from the pre-migration edital text
                // (git show 5f8c379^). Replace with the official edital
                // breakdown when available.
                'topics' => [
                    'Avaliação da habilidade do candidato em entender a estrutura lógica de relações entre pessoas, lugares, coisas e/ou eventos, deduzir novas informações e avaliar as condições usadas para estabelecer a estrutura dessas relações.',
                    'Áreas das questões: I - estruturas lógicas; II - lógica de argumentação; III - diagramas lógicos; IV - aritmética; V - álgebra e geometria básicas.',
                ],
                // Real aulas from the student's prep-course platform (see the
                // Língua Portuguesa entry above for the rationale).
                'aulas' => [
                    // Tópico 1 — art. 1 (lógica sequencial).
                    ['name' => 'Lógica Sequencial - Principais Macetes', 'minutes' => 31],
                    ['name' => 'Lógica Sequencial - Principais Macetes II', 'minutes' => 30],
                    ['name' => 'Lógica Sequencial - Principais Macetes III', 'minutes' => 29],
                    ['name' => 'Lógica Sequencial - Sequências Envolvendo Números', 'minutes' => 33],
                    ['name' => 'Lógica Sequencial - Sequências Envolvendo Números II', 'minutes' => 31],
                    ['name' => 'Lógica Sequencial - Sequências Envolvendo Letras e Palavras', 'minutes' => 30],
                    ['name' => 'Lógica Sequencial - Sequências Envolvendo Figuras', 'minutes' => 30],
                    ['name' => 'Lógica Sequencial - Problemas Matriciais - Correlacionamento (Associações Lógicas)', 'minutes' => 32],
                    ['name' => 'Lógica Sequencial - Verdades e Mentiras', 'minutes' => 31],
                    ['name' => 'Lógica Sequencial - Problemas Envolvendo Mesas', 'minutes' => 25],
                    ['name' => 'Lógica Sequencial - Problemas Aritméticos e Geométricos', 'minutes' => 33],
                    ['name' => 'Lógica Sequencial - Simulado', 'minutes' => 32],
                    ['name' => 'Lógica Sequencial - Simulado II', 'minutes' => 27],
                    ['name' => 'Lógica Sequencial - Simulado III', 'minutes' => 30],

                    // Tópico 2 — art. 2 (estruturas lógicas, argumentação,
                    // diagramas lógicos, aritmética, álgebra).
                    ['name' => 'Lógica Proposicional - Proposições, Tabela-Verdade', 'minutes' => 32],
                    ['name' => 'Lógica Proposicional - Proposições, Tabela-Verdade - Parte II', 'minutes' => 27],
                    ['name' => 'Lógica Proposicional - Conectivos Lógicos - Parte I', 'minutes' => 34],
                    ['name' => 'Lógica Proposicional - Conectivos Lógicos - Parte II', 'minutes' => 27],
                    ['name' => 'Lógica Proposicional - Conectivos Lógicos - Parte III', 'minutes' => 31],
                    ['name' => 'Lógica Proposicional - Conectivos Lógicos - Parte IV', 'minutes' => 17],
                    ['name' => 'Lógica Proposicional - Conectivos Lógicos - Parte V', 'minutes' => 30],
                    ['name' => 'Lógica Proposicional - Conectivos Lógicos - Parte VI', 'minutes' => 31],
                    ['name' => 'Lógica Proposicional - Negação dos Conectivos', 'minutes' => 31],
                    ['name' => 'Lógica Proposicional - Negação dos Conectivos II', 'minutes' => 31],
                    ['name' => 'Lógica Proposicional - Equivalências Lógicas', 'minutes' => 33],
                    ['name' => 'Lógica Proposicional - Equivalências Lógicas II', 'minutes' => 33],
                    ['name' => 'Lógica Proposicional - Equivalências Lógicas III', 'minutes' => 30],
                    ['name' => 'Lógica Proposicional - Classificação da Tabela-Verdade', 'minutes' => 30],
                    ['name' => 'Lógica Proposicional - Diagramas Lógicos - Quantificadores II', 'minutes' => 32],
                    ['name' => 'Lógica Proposicional - Negação dos Quantificadores', 'minutes' => 29],
                    ['name' => 'Lógica Proposicional - Argumentos', 'minutes' => 34],
                    ['name' => 'Lógica Proposicional - Argumentos II', 'minutes' => 29],
                    ['name' => 'Lógica Proposicional - Argumentos III', 'minutes' => 29],
                    ['name' => 'Lógica Proposicional - Argumentos IV', 'minutes' => 18],
                    ['name' => 'Lógica Proposicional - Simulado', 'minutes' => 27],
                    ['name' => 'Lógica Proposicional - Simulado II', 'minutes' => 25],
                    ['name' => 'Lógica Proposicional - Simulado III', 'minutes' => 26],
                    ['name' => 'Lógica Proposicional - Simulado IV', 'minutes' => 30],
                    ['name' => 'Frações', 'minutes' => 33],
                    ['name' => 'Frações II', 'minutes' => 33],
                    ['name' => 'Frações III', 'minutes' => 32],
                    ['name' => 'Conjuntos', 'minutes' => 28],
                    ['name' => 'Conjuntos II', 'minutes' => 32],
                    ['name' => 'Conjuntos III', 'minutes' => 29],
                    ['name' => 'Conjuntos IV', 'minutes' => 27],
                    ['name' => 'Conjuntos V', 'minutes' => 32],
                    ['name' => 'Equação do 1º Grau', 'minutes' => 27],
                    ['name' => 'Equação do 1º Grau II', 'minutes' => 33],
                    ['name' => 'Equação do 1º Grau III', 'minutes' => 27],
                    ['name' => 'Equação do 2º Grau', 'minutes' => 32],
                    ['name' => 'Equação do 2º Grau II', 'minutes' => 39],
                    ['name' => 'Equação do 2º Grau III', 'minutes' => 32],
                    ['name' => 'Sistemas de Equação do 1º Grau', 'minutes' => 31],
                    ['name' => 'Sistemas de Equação do 1º Grau II', 'minutes' => 36],
                    ['name' => 'Sistemas de Equação do 1º Grau III', 'minutes' => 29],

                    // Tópico 3 — geometria básica.
                    ['name' => 'Noções de Geometria: Ângulos', 'minutes' => 31],
                    ['name' => 'Noções de Geometria: Ângulos II', 'minutes' => 30],
                    ['name' => 'Noções de Geometria: Polígonos', 'minutes' => 33],
                    ['name' => 'Noções de Geometria: Polígonos II', 'minutes' => 30],
                    ['name' => 'Noções de Geometria: Triângulos', 'minutes' => 35],
                    ['name' => 'Noções de Geometria: Triângulos II', 'minutes' => 34],
                    ['name' => 'Noções de Geometria: Triângulos III', 'minutes' => 35],
                    ['name' => 'Noções de Geometria: Áreas de Figuras Planas', 'minutes' => 35],
                    ['name' => 'Noções de Geometria: Áreas de Figuras Planas II', 'minutes' => 31],
                    ['name' => 'Noções de Geometria: Áreas de Figuras Planas III', 'minutes' => 35],
                    ['name' => 'Noções de Geometria: Áreas de Figuras Planas IV', 'minutes' => 33],
                    ['name' => 'Noções de Geometria: Volume', 'minutes' => 30],
                ],
            ],
            [
                'name' => 'Conhecimentos Específicos — Desenvolvimento de TI',
                'weight' => 10,
                'difficulty' => 5,
                'color' => '#0ea5e9',
                'topics' => [
                    'Conceito de compilação e ligação de programas.',
                    [
                        'name' => 'Algoritmos e estrutura de dados: algoritmos de busca e de ordenação',
                        'subtopics' => [
                            'Estruturas de dados básicas (arrays, pilhas, listas e filas)',
                            'Tipos abstratos de dados',
                        ],
                    ],
                    [
                        'name' => 'Programação orientada a objetos: encapsulamento',
                        'subtopics' => [
                            'Classes e objetos',
                            'Herança e polimorfismo',
                        ],
                    ],
                    [
                        'name' => 'Linguagem de programação Java: variáveis e tipos de dados',
                        'subtopics' => [
                            'Operadores e expressões',
                            'Estruturas de controle (sequência, seleção e repetição)',
                            'Tratamento de exceção',
                            'Depuração de programas',
                            'Construção e uso de componentes e bibliotecas',
                            'Acesso a bancos de dados',
                            'Definição de formulários',
                            'Java EE',
                            'Desenvolvimento de aplicações com Eclipse',
                        ],
                    ],
                    [
                        'name' => 'Linguagem de programação C#: variáveis e tipos de dados',
                        'subtopics' => [
                            'Operadores e expressões',
                            'Estruturas de controle (sequência, seleção e repetição)',
                            'Tratamento de exceção',
                            'Depuração de programas',
                            'Construção e uso de componentes e bibliotecas',
                            'Acesso a bancos de dados',
                            'Definição de formulários',
                            'Desenvolvimento de aplicações com Visual Studio',
                        ],
                    ],
                    'NET. BANCOS DE DADOS: Modelagem conceitual de dados: abordagem E-R (entidades e atributos; relacionamentos e cardinalidades; generalização).',
                    'Conceitos, arquiteturas e paradigmas de sistemas de bancos de dados.',
                    'Modelo relacional: conceitos básicos.',
                    [
                        'name' => 'Projeto de bancos de dados relacionais: esquemas de bancos de dados relacionais',
                        'subtopics' => [
                            'Chave primária, alternativa e estrangeira',
                            'Dependência funcional',
                            'Normalização',
                            'Restrições de integridade',
                            'Mapeamento de modelo ER para modelo Relacional',
                        ],
                    ],
                    'Linguagens de definição (DDL), manipulação (DML) e controle de dados (DCL).',
                    'Linguagem SQL Padrão ANSI 1999.',
                    'Processamento de transações, controle de concorrência e recuperação.',
                    'Processamento de consultas, otimização e ajustes de bancos de dados.',
                    'Segurança.',
                    'Bancos de dados distribuídos: conceitos, tipos e arquiteturas.',
                    'SGBD Oracle: elementos básicos e programação com PL/SQL.',
                    'SGBD MySQL: elementos básicos.',
                    'SGBD MS SQL Server: elementos básicos.',
                    'SGBD PostgreSQL: elementos básicos e programação com PL/pgSQL.',
                    'Conceitos de Data Warehouse, OLAP e OLTP.',
                    'Mapeamento Objeto Relacional.',
                    'ENGENHARIA DE SOFTWARE: Conceitos gerais.',
                    'Ciclo de vida de software.',
                    [
                        'name' => 'Projeto de sistemas de informação: conceitos fundamentais',
                        'subtopics' => [
                            'Planejamento das atividades de análise',
                            'Projeto de entrada e de saída',
                            'Controle de sistemas',
                            'Implementação de sistemas',
                        ],
                    ],
                    [
                        'name' => 'Processo de software: Processo Unificado (UP) (conceitos gerais, disciplinas, fases, papéis, atividades e artefatos)',
                        'subtopics' => [
                            'Processos ágeis (eXtreme Programming, Scrum e Kanban)',
                            'CMM e CMMI (Capability Maturity Model Integration)',
                        ],
                    ],
                    'Análise, especificação e gerência de requisitos.',
                    [
                        'name' => 'Análise e projeto Orientados a Objetos: principais conceitos',
                        'subtopics' => [
                            'Identificação de classes primárias',
                            'Classes derivadas',
                            'Mensagens e seus tratadores',
                            'Representação',
                            'Linguagem de modelagem UML',
                            'Padrões de projeto (Design patterns)',
                            'Injeção de dependência',
                            'Inversão de controle',
                            'Refatoração',
                        ],
                    ],
                    [
                        'name' => 'Teste de software: técnicas de teste de software',
                        'subtopics' => [
                            'Teste unitário',
                            'Teste de integração',
                            'Teste funcional',
                            'Teste de aceitação',
                            'Teste de desempenho',
                            'Teste de carga',
                        ],
                    ],
                    [
                        'name' => 'Gestão da qualidade: qualidade de processo de software',
                        'subtopics' => [
                            'Qualidade do produto',
                        ],
                    ],
                    'Técnicas de estimativa de projetos: APF (Análise por pontos de função).',
                    [
                        'name' => 'Arquiteturas de software: padrões de arquitetura de aplicações corporativas',
                        'subtopics' => [
                            'MVC (Model-View-Controller)',
                            'Service-Oriented Architecture (SOA)',
                            'Camadas de acesso a dados (OLEDB, ODBC, JDBC)',
                            'Software as a Service (SAAS)',
                        ],
                    ],
                    [
                        'name' => 'Acessibilidade e engenharia de usabilidade: conceitos básicos de engenharia de usabilidade',
                        'subtopics' => [
                            'Critérios, recomendações e guias de estilo',
                            'Análise de requisitos de usabilidade',
                            'Concepção, projeto e implementação de interfaces',
                        ],
                    ],
                    [
                        'name' => 'APLICAÇÕES DISTRIBUÍDAS: Monitores de processos e transações (TP monitors)',
                        'subtopics' => [
                            'Gerência e protocolos de transações distribuídas',
                        ],
                    ],
                    'Conceito de servidor de aplicação.',
                    'Aplicações móveis (tablets, celulares, PDAs e netbooks).',
                    'REDES DE COMPUTADORES E INTERNET: Conceitos básicos de comunicação de dados.',
                    [
                        'name' => 'Protocolo TCP/IP; Serviços: telnet, FTP, SFTP, SSH',
                        'subtopics' => [
                            'Segurança: firewalls, mecanismos de autenticação, criptografia, certificados digitais e vírus',
                        ],
                    ],
                    'TECNOLOGIAS WEB: Servidores Web (Apache e IIS).',
                    'SOAP e REST.',
                    'Linguagens de marcação: XML, HTML, XHTML e DHTML.',
                    'CSS.',
                    'Ajax.',
                    'Tecnologias de multimídia e hipermídia.',
                    'Conceitos de comércio eletrônico.',
                    'GESTÃO DE TECNOLOGIA DA INFORMAÇÃO: Gerência de projetos: PMBOK (4ª edição).',
                    'ITIL V3.',
                    'COBIT.',
                    'Análise e modelagem Processos de Negócio: BPM e BPMN.',
                    [
                        'name' => 'Fundamentos da Computação: estrutura de dados',
                        'subtopics' => [
                            'Algoritmos (busca, ordenação, complexidade)',
                            'Programação orientada a objetos e programação funcional',
                            'Versionamento (git)',
                        ],
                    ],
                    [
                        'name' => 'Engenharia de Software e Requisitos: engenharia de requisitos (elicitação, análise, validação)',
                        'subtopics' => [
                            'Modelagem (UML, casos de uso, user stories)',
                            'Arquiteturas (REST, microsserviços, event-driven)',
                            'Padrões de projeto',
                            'Testes (unitário, integração, contrato)',
                            'CI/CD e DevOps',
                        ],
                    ],
                    [
                        'name' => 'Desenvolvimento (incluindo Web): HTTP/HTTPS, APIs REST e GraphQL',
                        'subtopics' => [
                            'Backend (Node.js, Python, Java)',
                            'Frameworks: Node.js/Express, Python/FastAPI ou Django REST Framework, Java/Spring Boot',
                            'Frontend moderno (SPA – Svelte, React ou similar)',
                            'HTML5, CSS3 e JavaScript moderno (ES6+)',
                            'TypeScript (tipagem estática, interfaces e generics)',
                            'Segurança (OAuth2, JWT, OWASP Top 10)',
                            'Integração de serviços',
                            'Ambientes de desenvolvimento (Visual Studio Code, Visual Studio .NET)',
                            'XML, XML Schema, JSON',
                        ],
                    ],
                    [
                        'name' => 'Bancos de Dados: banco de dados relacionais incluindo extensão espacial (Postgresql/PostGIS)',
                        'subtopics' => [
                            'Modelagem relacional (SQL)',
                            'Modelagem de dados',
                            'SQL (DDL, DML, DCL)',
                            'Linguagem procedural PL/pgSQL',
                            'Transações e consistência',
                            'Indexação (incluindo índices espaciais) e otimização',
                            'Bancos de dados NoSQL (MongoDB, Redis)',
                        ],
                    ],
                    [
                        'name' => 'Dados Geoespaciais: modelos de dados geográficos (vetor e raster)',
                        'subtopics' => [
                            'Sistemas de referência (CRS, projeções cartográficas)',
                            'Operações espaciais (buffer, overlay, spatial Join, entre outras)',
                            'Python geoespacial (GeoPandas, Shapely, Fiona, Rasterio, PyProj)',
                            'Serviços e Padrões Open Geospatial Consortium (OGC): WMS, WFS, WCS, CSW',
                            'OGC APIs',
                            'Servidores de mapas e metadados espaciais: GeoServer e Geonetwork (conceitos e configuração)',
                            'Tiles e pirâmides de mapa',
                            'Protocolos XYZ e WMTS',
                            'Metadados geoespaciais: ISO 19115 / 191115-1// 19115-2 / 19115-3/ 19139',
                            'Infraestruturas de Dados Espaciais (IDE) e interoperabilidade',
                        ],
                    ],
                    [
                        'name' => 'Integração e Interoperabilidade: Arquitetura Orientada a Serviço (SOA)',
                        'subtopics' => [
                            'Web services e GeoWEB services (REST)',
                            'Open API; APIs e integração de sistemas',
                            'Formatos e esquemas padronizados: JSON, GeoJSON, XML, XML Schema',
                            'Catálogos e descoberta de dados (CSW, DCAT)',
                        ],
                    ],
                    [
                        'name' => 'Inteligência Artificial Aplicada: fundamentos de IA e aprendizado de máquina',
                        'subtopics' => [
                            'Uso de IA no desenvolvimento (LLMs, copilots)',
                            'Engenharia de prompt',
                            'Automação de código e testes com IA',
                            'Uso de IA para análise de dados (incluindo geoespaciais)',
                            'Ética e governança em IA',
                        ],
                    ],
                    [
                        'name' => 'Governança, Dados e Legislação: LGPD (Lei Geral de Proteção de Dados)',
                        'subtopics' => [
                            'Lei de Acesso à Informação',
                            'Governança de dados; qualidade de dados',
                            'Dados abertos e interoperabilidade governamental',
                        ],
                    ],
                    [
                        'name' => 'Sistemas Operacionais, Redes e Segurança (Fundamentos Aplicados): sistemas operacionais - conceitos básicos (processos, threads, memória)',
                        'subtopics' => [
                            'Sistemas operacionais Windows, Linux (comandos básicos, permissões); containers (Docker – conceitos)',
                            'Modelo TCP/IP – conceitos',
                            'HTTP/HTTPS (requisição, resposta, headers, status codes)',
                            'DNS, IP, portas',
                            'Comunicação cliente-servidor',
                            'Latência, throughput e noções de escalabilidade',
                            'Autenticação e autorização (OAuth2, JWT)',
                            'Criptografia básica (TLS/HTTPS)',
                            'OWASP Top 10 (principais vulnerabilidades)',
                            'Segurança em APIs',
                            'Controle de acesso a dados (incluindo LGPD)',
                        ],
                    ],
                ],
                // No prep-course aulas tracked for this subject yet.
                'aulas' => [],
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

            // Edital topics — flat list, one string per item, except when an
            // item carries 'subtopics': then it becomes a grouping header
            // (not itself studyable — see Topic::scopeStudyable()) and each
            // subtopic gets its own leaf row underneath it.
            $topicNames = collect($data['topics'])->map(fn ($t) => is_array($t) ? $t['name'] : $t);
            foreach ($data['topics'] as $i => $item) {
                $name = is_array($item) ? $item['name'] : $item;

                $topic = Topic::updateOrCreate(
                    ['subject_id' => $subject->id, 'parent_id' => null, 'name' => $name],
                    ['order' => $i, 'estimated_minutes' => 45]
                );

                $subtopicNames = collect(is_array($item) ? ($item['subtopics'] ?? []) : []);
                foreach ($subtopicNames as $j => $subName) {
                    Topic::updateOrCreate(
                        ['subject_id' => $subject->id, 'parent_id' => $topic->id, 'name' => $subName],
                        ['order' => $j, 'estimated_minutes' => 45]
                    );
                }
                Topic::where('parent_id', $topic->id)->whereNotIn('name', $subtopicNames)->delete();
            }

            // Prep-course aulas — separate resource, not tied to any topic.
            $aulaNames = collect($data['aulas'])->pluck('name');
            foreach ($data['aulas'] as $i => $aula) {
                Aula::updateOrCreate(
                    ['subject_id' => $subject->id, 'name' => $aula['name']],
                    ['order' => $i, 'minutes' => $aula['minutes']]
                );
            }

            // The seeder is the single source of truth for topics/aulas: drop
            // ones no longer listed (top-level only — subtopics were already
            // pruned per-parent above, and dropping a header cascades to its
            // subtopics via the FK).
            Topic::where('subject_id', $subject->id)->whereNull('parent_id')->whereNotIn('name', $topicNames)->delete();
            Aula::where('subject_id', $subject->id)->whereNotIn('name', $aulaNames)->delete();
        }
    }
}
