<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Course;
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
            ],
            [
                'name' => 'Raciocínio Lógico Quantitativo',
                'weight' => 5,
                'difficulty' => 3,
                'color' => '#8b5cf6',
                'topics' => [
                    'Avaliação da habilidade do candidato em entender a estrutura lógica de relações entre pessoas, lugares, coisas e/ou eventos, deduzir novas informações e avaliar as condições usadas para estabelecer a estrutura dessas relações.',
                    'Áreas das questões: I - estruturas lógicas; II - lógica de argumentação; III - diagramas lógicos; IV - aritmética; V - álgebra e geometria básicas.',
                ],
            ],
            [
                'name' => 'Conhecimentos Específicos — Desenvolvimento de TI',
                'weight' => 10,
                'difficulty' => 5,
                'color' => '#0ea5e9',
                'topics' => [
                    'Conceito de compilação e ligação de programas.',
                    'Algoritmos e estrutura de dados: algoritmos de busca e de ordenação; 2.1. Estruturas de dados básicas (arrays, pilhas, listas e filas); 2.2. Tipos abstratos de dados.',
                    'Programação orientada a objetos: encapsulamento; 3.1. classes e objetos; 3.2. herança e polimorfismo.',
                    'Linguagem de programação Java: variáveis e tipos de dados; 4.1. Operadores e expressões; 4.2. Estruturas de controle (sequência, seleção e repetição); 4.3. Tratamento de exceção; 4.4. Depuração de programas; 4.5. Construção e uso de componentes e bibliotecas; 4.6. Acesso a bancos de dados; 4.7. Definição de formulários; 4.8. Java EE; 4.9. Desenvolvimento de aplicações com Eclipse.',
                    'Linguagem de programação C#: variáveis e tipos de dados; 5.1. Operadores e expressões; 5.2. Estruturas de controle (sequência, seleção e repetição); 5.3. Tratamento de exceção; 5.4. Depuração de programas; 5.5. Construção e uso de componentes e bibliotecas; 5.6. Acesso a bancos de dados; 5.7. Definição de formulários; 5.8. Desenvolvimento de aplicações com Visual Studio.',
                    'NET. BANCOS DE DADOS: Modelagem conceitual de dados: abordagem E-R (entidades e atributos; relacionamentos e cardinalidades; generalização).',
                    'Conceitos, arquiteturas e paradigmas de sistemas de bancos de dados.',
                    'Modelo relacional: conceitos básicos.',
                    'Projeto de bancos de dados relacionais: esquemas de bancos de dados relacionais; 9.1. Chave primária, alternativa e estrangeira; 9.2. Dependência funcional; 9.3. Normalização; 9.4. Restrições de integridade; 9.5. Mapeamento de modelo ER para modelo Relacional.',
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
                    'Projeto de sistemas de informação: conceitos fundamentais; 24.1. Planejamento das atividades de análise; 24.2. Projeto de entrada e de saída; 24.3. Controle de sistemas; 24.4. Implementação de sistemas.',
                    'Processo de software: Processo Unificado (UP) (conceitos gerais, disciplinas, fases, papéis, atividades e artefatos); 25.1. Processos ágeis (eXtreme Programming, Scrum e Kanban); 25.2. CMM e CMMI (Capability Maturity Model Integration).',
                    'Análise, especificação e gerência de requisitos.',
                    'Análise e projeto Orientados a Objetos: principais conceitos; 27.1. Identificação de classes primárias; 27.2. Classes derivadas; 27.3. Mensagens e seus tratadores; 27.4. Representação; 27.5. Linguagem de modelagem UML; 27.6. Padrões de projeto (Design patterns); 27.7. Injeção de dependência; 27.8. Inversão de controle; 27.9. Refatoração.',
                    'Teste de software: técnicas de teste de software; 28.1. Teste unitário; 28.2. Teste de integração; 28.3. Teste funcional; 28.4. Teste de aceitação; 28.5. Teste de desempenho; 28.6. Teste de carga.',
                    'Gestão da qualidade: qualidade de processo de software; 29.1. Qualidade do produto.',
                    'Técnicas de estimativa de projetos: APF (Análise por pontos de função).',
                    'Arquiteturas de software: padrões de arquitetura de aplicações corporativas; 31.1. MVC (Model-View-Controller); 31.2. Service-Oriented Architecture (SOA); 31.3. Camadas de acesso a dados (OLEDB, ODBC, JDBC); 31.4. Software as a Service (SAAS).',
                    'Acessibilidade e engenharia de usabilidade: conceitos básicos de engenharia de usabilidade; 32.1. Critérios, recomendações e guias de estilo; 32.2. Análise de requisitos de usabilidade; 32.3. Concepção, projeto e implementação de interfaces.',
                    'APLICAÇÕES DISTRIBUÍDAS: Monitores de processos e transações (TP monitors); 33.1. Gerência e protocolos de transações distribuídas.',
                    'Conceito de servidor de aplicação.',
                    'Aplicações móveis (tablets, celulares, PDAs e netbooks).',
                    'REDES DE COMPUTADORES E INTERNET: Conceitos básicos de comunicação de dados.',
                    'Protocolo TCP/IP; Serviços: telnet, FTP, SFTP, SSH; 37.1. Segurança: firewalls, mecanismos de autenticação, criptografia, certificados digitais e vírus.',
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
                    'Fundamentos da Computação: estrutura de dados; 49.1. algoritmos (busca, ordenação, complexidade); 49.2. programação orientada a objetos e programação funcional; 49.3. vercionamento (git).',
                    'Engenharia de Software e Requisitos: engenharia de requisitos (elicitação, análise, validação); 50.1. modelagem (UML, casos de uso, user stories); 50.2. arquiteturas (REST, microsserviços, event-driven); 50.3. padrões de projeto; 50.4. testes (unitário, integração, contrato); 50.5. CI/CD e DevOps.',
                    'Desenvolvimento (incluindo Web): HTTP/HTTPS, APIs REST e GraphQL; 51.1. backend (Node.js, Python, Java); 51.2. frameworks: Node.js/Express, Python/FastAPI ou Django REST Framework, Java/Spring Boot; 51.3. frontend moderno (SPA – Svelte, React ou similar); 51.4. HTML5, CSS3 e JavaScript moderno (ES6+); 51.5. TypeScript (tipagem estática, interfaces e generics); 51.6. segurança (OAuth2, JWT, OWASP Top 10); 51.7. integração de serviços; 51.8. ambientes de desenvolvimento (Visual Studio Code, Visual Studio .NET); 51.9. XML, XML Schema, JSON.',
                    'Bancos de Dados: banco de dados relacionais incluindo extensão espacial (Postgresql/PostGIS); 52.1. modelagem relacional (SQL); 52.2. modelagem de dados; 52.3. SQL (DDL, DML, DCL); 52.4. linguagem procedural PL/pgSQL; 52.5. transações e consistência; 52.6. indexação (incluindo índices espaciais) e otimização; 52.7. bancos de dados NoSQL (MongoDB, Redis).',
                    'Dados Geoespaciais: modelos de dados geográficos (vetor e raster); 53.1. sistemas de referência (CRS, projeções cartográficas); 53.2. operações espaciais (buffer, overlay, spatial Join, entre outras); 53.3. python geoespacial (GeoPandas, Shapely, Fiona, Rasterio, PyProj); 53.4. serviços e Padrões Open Geospatial Consortium (OGC): WMS, WFS, WCS, CSW; 53.5. OGC APIs; 53.6. servidores de mapas e metadados espaciais: GeoServer e Geonetwork (conceitos e configuração); 53.7 tiles e pirâmides de mapa; 53.8. protocolos XYZ e WMTS; 53.9. metadados geoespaciais: ISO 19115 / 191115-1// 19115-2 / 19115-3/ 19139; 53.10. Infraestruturas de Dados Espaciais (IDE) e interoperabilidade.',
                    'Integração e Interoperabilidade: Arquitetura Orientada a Serviço (SOA); 54.1. web services e GeoWEB services (REST); 54.2. Open API; APIs e integração de sistemas; 54.3. formatos e esquemas padronizados: JSON, GeoJSON, XML, XML Schema; 54.4. catálogos e descoberta de dados (CSW, DCAT).',
                    'Inteligência Artificial Aplicada: fundamentos de IA e aprendizado de máquina; 55.1. uso de IA no desenvolvimento (LLMs, copilots); 55.2. engenharia de prompt; 55.3. automação de código e testes com IA; 55.4. uso de IA para análise de dados (incluindo geoespaciais); 55.5. ética e governança em IA.',
                    'Governança, Dados e Legislação: LGPD (Lei Geral de Proteção de Dados); 56.1. Lei de Acesso à Informação; 56.2. governança de dados; qualidade de dados; 56.3. dados abertos e interoperabilidade governamental.',
                    'Sistemas Operacionais, Redes e Segurança (Fundamentos Aplicados): sistemas operacionais - conceitos básicos (processos, threads, memória); 57.1. sistemas operacionais Windows, Linux (comandos básicos, permissões); containers (Docker – conceitos); 57.2. modelo TCP/IP – conceitos; 57.3. HTTP/HTTPS (requisição, resposta, headers, status codes); 57.4. DNS, IP, portas; 57.5. comunicação cliente-servidor; 57.6. latência, throughput e noções de escalabilidade; 57.7. autenticação e autorização (OAuth2, JWT); 57.8. criptografia básica (TLS/HTTPS); 57.9. OWASP Top 10 (principais vulnerabilidades); 57.10. segurança em APIs; 57.11. controle de acesso a dados (incluindo LGPD).',
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
