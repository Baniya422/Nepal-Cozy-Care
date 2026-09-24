#!/usr/bin/env bash
set -e

# Default port to 8000 if not provided by Render
PORT="${PORT:-8000}"

echo "Configuring Apache to listen on 0.0.0.0:${PORT}..."
sed -i "s/Listen [0-9]*/Listen 0.0.0.0:${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost 0.0.0.0:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Ensure writable directories exist with correct permissions
mkdir -p /var/www/html/storage/framework/{sessions,views,cache} /var/www/html/storage/logs /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Clear stale caches
echo "Clearing application cache..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Ensure storage symlink exists
echo "Ensuring public storage symlink..."
if [ -e /var/www/html/public/storage ] && [ ! -L /var/www/html/public/storage ]; then
    echo "Removing placeholder public/storage directory..."
    rm -rf /var/www/html/public/storage
fi
php artisan storage:link || true

# Run database migrations and seeds if enabled
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || {
        echo "Migration warning: could not run migrations immediately. Please check database connection."
    }

    echo "Running database seeders..."
    php artisan db:seed --force || {
        echo "Seeding warning: could not run seeders immediately."
    }
fi

# In production, cache config, routes, and views for optimal performance
if [ "${APP_ENV}" = "production" ]; then
    echo "Optimizing application for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "Starting Apache on 0.0.0.0:${PORT}..."
exec apache2-foreground
