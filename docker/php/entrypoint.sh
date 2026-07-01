#!/bin/bash
set -e

cd /var/www/html

export COMPOSER_PROCESS_TIMEOUT=0

# Install PHP dependencies if they are missing (first boot). We check for the
# autoloader rather than the directory, since vendor/ is a (possibly empty)
# named-volume mount point.
if [ ! -f "vendor/autoload.php" ]; then
    echo "==> Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --no-audit --optimize-autoloader
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

# Ensure storage & cache dirs exist and are writable by the php-fpm worker
# (www-data). Ownership matters: chmod 775 alone leaves www-data in "others".
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Wait for the database, then run migrations
echo "==> Running database migrations..."
php artisan migrate --force || echo "!! Migrations skipped/failed (db may not be ready yet)"

exec "$@"
