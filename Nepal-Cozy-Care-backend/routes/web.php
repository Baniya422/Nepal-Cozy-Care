<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);


// Direct storage file serving fallback for public uploads (ensures images work regardless of symlink status)
Route::get('/storage/{path}', function (string $path) {
    $filePath = storage_path('app/public/'.$path);
    if (! file_exists($filePath)) {
        abort(404);
    }

    $mime = match (strtolower(pathinfo($filePath, PATHINFO_EXTENSION))) {
        'jpg', 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        default => mime_content_type($filePath) ?: 'application/octet-stream',
    };

    return response()->file($filePath, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=86400',
        'Access-Control-Allow-Origin' => '*',
    ]);
})->where('path', '.*');
