# Backend-Frontend Connection Guide

This guide explains how the backend and frontend are connected and how to run them.

## Architecture

- **Backend**: Laravel 12 API (PHP) running on `http://127.0.0.1:8000`
- **Frontend**: React + TypeScript + Vite running on `http://localhost:5173`

## Connection Setup

### 1. Backend Configuration

**CORS Configuration** (`Nepal-Cozy-Care-backend/config/cors.php`):
- Configured to allow requests from `http://localhost:5173` and `http://127.0.0.1:5173`
- Handles all `/api/*` routes

**Middleware** (`Nepal-Cozy-Care-backend/bootstrap/app.php`):
- `HandleCors` middleware is enabled for API routes

**API Routes** (`Nepal-Cozy-Care-backend/routes/api.php`):
- Test endpoint: `GET /api/ping` - Returns connection status

### 2. Frontend Configuration

**API Service** (`Nepal-Cozy-Care-frontend/src/services/api.ts`):
- Reusable API service class for making HTTP requests
- Methods: `get()`, `post()`, `put()`, `delete()`, `ping()`
- Uses native `fetch` API (no external dependencies needed)

**Vite Proxy** (`Nepal-Cozy-Care-frontend/vite.config.ts`):
- Proxies all `/api/*` requests to `http://127.0.0.1:8000`
- This allows the frontend to use relative URLs like `/api/ping`

**App Component** (`Nepal-Cozy-Care-frontend/src/App.tsx`):
- Automatically tests the backend connection on mount
- Displays connection status (connected/failed/loading)

## How to Run

### Start the Backend

1. Navigate to the backend directory:
```bash
cd Nepal-Cozy-Care-backend
```

2. Install dependencies (if not already done):
```bash
composer install
```

3. Start the Laravel development server:
```bash
php artisan serve
```

The backend will be available at `http://127.0.0.1:8000`

### Start the Frontend

1. Navigate to the frontend directory (in a new terminal):
```bash
cd Nepal-Cozy-Care-frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Testing the Connection

1. Open `http://localhost:5173` in your browser
2. The app will automatically test the backend connection
3. You should see:
   - ✅ "Laravel API is connected" if successful
   - ❌ Error message if the backend is not running

## Making API Calls

Use the API service in your React components:

```typescript
import apiService from './services/api';

// GET request
const data = await apiService.get('/ping');

// POST request
const result = await apiService.post('/endpoint', { key: 'value' });

// PUT request
const updated = await apiService.put('/endpoint/1', { key: 'newValue' });

// DELETE request
await apiService.delete('/endpoint/1');
```

## Troubleshooting

### CORS Errors
- Ensure the backend is running on `http://127.0.0.1:8000`
- Check that `config/cors.php` has the correct allowed origins
- Verify the `HandleCors` middleware is enabled in `bootstrap/app.php`

### Connection Refused
- Make sure the backend server is running (`php artisan serve`)
- Check that the backend is accessible at `http://127.0.0.1:8000`
- Verify the Vite proxy configuration in `vite.config.ts`

### 404 Errors
- Ensure your API routes are defined in `routes/api.php`
- Laravel API routes are prefixed with `/api` by default
- Check the Laravel routes: `php artisan route:list`
