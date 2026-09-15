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
];

$allowedOrigins = array_values(array_unique(array_merge($defaultOrigins, $frontendUrls)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS_PATTERNS', ''))),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', true),
];

