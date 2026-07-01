# Ciclo Inteligente

Plataforma educacional que transforma o conteúdo de cursos preparatórios em um
**plano de estudos inteligente, personalizado e automático** — o *Ciclo Inteligente*.

## Stack

| Camada           | Tecnologia                                   |
| ---------------- | -------------------------------------------- |
| Backend          | Laravel 12 (PHP 8.3)                          |
| Frontend         | React 18 + Tailwind CSS via **Inertia.js**   |
| Banco de dados   | PostgreSQL 16                                 |
| Servidor web     | Nginx                                         |
| Build de assets  | Vite                                          |
| Infraestrutura   | Docker + docker-compose                       |

Tudo roda em containers — **você não precisa de PHP, Composer ou Node instalados
na sua máquina**, apenas do Docker.

## Serviços (docker-compose)

| Serviço | Descrição                        | Porta (host) |
| ------- | -------------------------------- | ------------ |
| `web`   | Nginx servindo `public/`         | `8080`       |
| `app`   | PHP-FPM + Laravel                | —            |
| `db`    | PostgreSQL 16                    | `5432`       |
| `node`  | Vite (dev server / HMR)          | `5173`       |

## Como rodar

```bash
# 1. Crie o arquivo de ambiente
cp .env.example .env

# 2. Suba a stack (constrói as imagens na primeira vez)
docker compose up -d --build
```

No **primeiro boot**, o `entrypoint` do container `app`:

1. roda `composer install`;
2. cria o `.env` (se faltar) e gera a `APP_KEY`;
3. ajusta permissões de `storage/` e `bootstrap/cache/`;
4. executa as `migrations`.

O container `node` roda `npm install` e sobe o Vite automaticamente.

Depois, acesse:

- **App:** http://localhost:8080
- **Vite HMR:** http://localhost:5173 (usado pelo app, não abra direto)

### Popular com dados de exemplo

```bash
docker compose exec app php artisan db:seed
# ou, para recriar tudo:
docker compose exec app php artisan migrate:fresh --seed
```

Usuário demo criado pelo seeder: `aluno@ciclointeligente.test` / `password`.

## Atalhos (Makefile)

```bash
make up        # sobe os containers
make build     # rebuild + up
make fresh     # migrate:fresh --seed
make shell     # bash no container app
make psql      # cliente psql
make test      # roda os testes
make logs      # acompanha logs
```

## Modelo de dados (domínio)

```
User ──< StudyCycle >── Course
                │           │
                │           └──< Subject ──< Topic
                │                   │
                └──< StudyCycleItem ┘  (bloco: disciplina + minutos)
                          │
User ──< StudySession >───┘  (registro real de estudo: tempo, questões, acertos)
```

- **Course** — curso preparatório (ex.: "Concurso Tribunais 2026").
- **Subject** — disciplina, com `weight` (peso) e `difficulty` que alimentam a
  geração do ciclo.
- **Topic** — assunto dentro da disciplina.
- **StudyCycle** — o ciclo personalizado do aluno para um curso.
- **StudyCycleItem** — cada bloco da rotação (disciplina + minutos planejados).
- **StudySession** — registro real de estudo (tempo, questões, acertos), base
  para a inteligência que reajusta os pesos.

## Estrutura

```
.
├── app/
│   ├── Http/Controllers/      # DashboardController, ...
│   ├── Http/Middleware/       # HandleInertiaRequests
│   └── Models/                # Course, Subject, Topic, StudyCycle, ...
├── config/                    # app, database (pgsql), auth, session, ...
├── database/migrations/       # schema (users + domínio Ciclo Inteligente)
├── database/seeders/          # DatabaseSeeder (curso demo)
├── docker/
│   ├── nginx/default.conf
│   └── php/{Dockerfile,entrypoint.sh,local.ini}
├── resources/
│   ├── js/app.jsx             # bootstrap Inertia + React
│   ├── js/Pages/              # Welcome.jsx, Dashboard.jsx
│   └── css/app.css            # Tailwind
├── routes/web.php
├── docker-compose.yml
└── vite.config.js
```

## Próximos passos sugeridos

1. Autenticação (Laravel Breeze — stack React/Inertia).
2. CRUD de cursos, disciplinas e tópicos.
3. Serviço gerador do ciclo (`CycleGeneratorService`) a partir dos pesos.
4. Registro de sessões de estudo e dashboard de desempenho.
5. Ajuste automático de pesos com base na taxa de acertos.
