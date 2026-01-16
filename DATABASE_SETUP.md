# Database Setup Guide for XAMPP

This guide will help you create the MySQL database in XAMPP and configure Laravel to use it.

## Step 1: Start XAMPP

1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL** services
3. Make sure both services are running (green indicator)

## Step 2: Create Database via phpMyAdmin

### Option A: Using phpMyAdmin (Recommended)

1. Open your web browser
2. Go to: `http://localhost/phpmyadmin`
3. Click on the **"SQL"** tab at the top
4. Enter the following SQL command:

```sql
CREATE DATABASE nepal_cozy_care CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Click **"Go"** button
6. You should see a success message: "Database `nepal_cozy_care` has been created"

### Option B: Using phpMyAdmin UI

1. Open your web browser
2. Go to: `http://localhost/phpmyadmin`
3. Click on **"New"** in the left sidebar
4. Under "Database name", enter: `nepal_cozy_care`
5. Under "Collation", select: `utf8mb4_unicode_ci`
6. Click **"Create"** button

## Step 3: Configure Laravel .env File

1. Navigate to: `Nepal-Cozy-Care-backend` folder
2. Create a new file named `.env` (if it doesn't exist)
3. Copy and paste the following content:

```env
APP_NAME="Nepal Cozy Care"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nepal_cozy_care
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
```

**Important Notes:**
- If your MySQL has a password, update `DB_PASSWORD=your_password`
- The default XAMPP MySQL username is `root` with no password (empty)

## Step 4: Generate Application Key

After creating the `.env` file, run this command in the backend directory:

```bash
cd Nepal-Cozy-Care-backend
php artisan key:generate
```

This will automatically fill in the `APP_KEY` in your `.env` file.

## Step 5: Run Migrations

Create the database tables by running:

```bash
php artisan migrate
```

This will create all the necessary tables in your `nepal_cozy_care` database.

## Step 6: Verify Connection

Test if Laravel can connect to your database:

```bash
php artisan db:show
```

You should see information about your database connection.

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Your MySQL might have a password
- Update `DB_PASSWORD=your_password` in `.env` file

### Error: "Unknown database 'nepal_cozy_care'"
- Make sure you created the database in phpMyAdmin
- Check the database name spelling in `.env` file

### Error: "SQLSTATE[HY000] [2002] No connection could be made"
- Make sure MySQL service is running in XAMPP
- Check that `DB_HOST=127.0.0.1` and `DB_PORT=3306` in `.env`

### Can't create .env file?
- Make sure you're in the `Nepal-Cozy-Care-backend` folder
- The file should be named exactly `.env` (with the dot at the beginning)
- On Windows, you might need to create it as `.env.` (with a dot at the end) first, then rename it

## Quick Verification

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on `nepal_cozy_care` database in the left sidebar
3. After running migrations, you should see tables like:
   - `users`
   - `cache`
   - `cache_locks`
   - `jobs`
   - `migrations`
   - etc.
