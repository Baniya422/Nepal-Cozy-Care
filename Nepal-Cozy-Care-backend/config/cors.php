<?php

$frontendUrls = array_values(array_filter(array_map(function ($url) {
    return rtrim(trim($url), '/');
}, explode(',', env('FRONTEND_URL', '')))));

$defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nepal-cozy-care.onrender.com',
    'https://nepal-cozy-care-frontend.onrender.com',
];

$allowedOrigins = array_values(array_unique(array_merge($defaultOrigins, $frontendUrls)));

$customPatterns = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS_PATTERNS', ''))));

$defaultPatterns = [
    '#^https://nepal-cozy-care.*\.onrender\.com$#',
    '#^https://.*\.onrender\.com$#',
];

$allowedPatterns = array_values(array_unique(array_merge($defaultPatterns, $customPatterns)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => $allowedPatterns,
    'allowed_headers' => ['*'],
    'exposed_headers' => ['*'],
    'max_age' => 86400,
    'supports_credentials' => true,
];

