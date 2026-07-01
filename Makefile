# Ciclo Inteligente — atalhos de desenvolvimento
# Uso: make <alvo>

.PHONY: up down build restart logs shell psql install migrate fresh seed test npm

up: ## Sobe todos os containers
	docker compose up -d

build: ## (Re)constrói as imagens e sobe
	docker compose up -d --build

down: ## Derruba os containers
	docker compose down

restart: ## Reinicia os containers
	docker compose restart

logs: ## Acompanha os logs
	docker compose logs -f

shell: ## Abre um shell no container da aplicação
	docker compose exec app bash

psql: ## Abre o cliente psql no banco
	docker compose exec db psql -U ciclo -d ciclo_inteligente

install: ## Instala dependências PHP e JS
	docker compose exec app composer install
	docker compose run --rm node npm install

migrate: ## Roda as migrations
	docker compose exec app php artisan migrate

fresh: ## Recria o banco e roda os seeders
	docker compose exec app php artisan migrate:fresh --seed

seed: ## Roda os seeders
	docker compose exec app php artisan db:seed

test: ## Roda os testes
	docker compose exec app php artisan test

key: ## Gera a APP_KEY
	docker compose exec app php artisan key:generate
