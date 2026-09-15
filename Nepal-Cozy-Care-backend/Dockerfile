# Production Dockerfile for Laravel Backend on Render
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install required PHP extensions
RUN docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_pgsql \
    pgsql \
    pdo_mysql \
    bcmath \
    zip \
    opcache

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy custom Apache configuration
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && sed -i 's/memory_limit = .*/memory_limit = 256M/' "$PHP_INI_DIR/php.ini" \
    && sed -i 's/upload_max_filesize = .*/upload_max_filesize = 10M/' "$PHP_INI_DIR/php.ini" \
    && sed -i 's/post_max_size = .*/post_max_size = 12M/' "$PHP_INI_DIR/php.ini"

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install Composer dependencies (production only, no dev dependencies)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Set directory permissions for Laravel storage and cache
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} /var/www/html/storage/logs /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod +x /var/www/html/docker/entrypoint.sh

# Expose dynamic Render port (Render injects $PORT at runtime, usually 10000)
EXPOSE 8000 10000

# Entrypoint script handles migrations, caching, dynamic port binding, and web server start
ENTRYPOINT ["/var/www/html/docker/entrypoint.sh"]
