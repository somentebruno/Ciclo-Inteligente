#!/bin/bash
set -e

cd /var/www/html

# Install PHP dependencies if vendor/ is missing (first boot)
if [ ! -d "vendor" ]; then
    echo "==> Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Ensure .env exists
if [ ! -f ".env" ]; then
    echo "==> Creating .env from .env.example..."
    cp .env.example .env
fi

# Generate app key if not set
if ! grep -q "^APP_KEY=base64:" .env; then
    echo "==> Generating application key..."
    php artisan key:generate --force
fi

# Ensure storage & cache dirs are writable
mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache || true

# Wait for the database, then run migrations
echo "==> Running database migrations..."
php artisan migrate --force || echo "!! Migrations skipped/failed (db may not be ready yet)"

exec "$@"
