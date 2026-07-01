FROM php:8.3-fpm-alpine

# System dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    postgresql-dev \
    oniguruma-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        intl \
        bcmath \
        opcache

# Composer (from official image)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Run as a non-root user matching the typical host UID to avoid permission issues
ARG UID=1000
ARG GID=1000
RUN addgroup -g ${GID} appgroup 2>/dev/null || true \
    && adduser -D -u ${UID} -G appgroup appuser 2>/dev/null || true

WORKDIR /var/www/html

# Copy entrypoint that installs deps and prepares the app on first run
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]
