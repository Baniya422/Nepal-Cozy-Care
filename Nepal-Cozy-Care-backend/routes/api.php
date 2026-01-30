<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlantController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ReviewController;

// Test endpoint where ping testing is done to check if API is connected
Route::get('/ping', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Laravel API is connected!'
    ]);
});

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Public plant routes (browsing and learning)
Route::get('/plants', [PlantController::class, 'index']);        // list all active plants with filters
Route::get('/plants/{id}', [PlantController::class, 'show']);    // single plant detail

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Admin: plant management
    Route::post('/plants', [PlantController::class, 'store']);
    Route::put('/plants/{id}', [PlantController::class, 'update']);
    Route::delete('/plants/{id}', [PlantController::class, 'destroy']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);        // view cart
    Route::post('/cart', [CartController::class, 'store']);       // add item
    Route::put('/cart/{id}', [CartController::class, 'update']);  // update quantity
    Route::delete('/cart/{id}', [CartController::class, 'destroy']); // remove item
    Route::delete('/cart', [CartController::class, 'clear']);     // clear cart

    // Orders
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{plantId}', [WishlistController::class, 'destroy']);

    // Reviews (creating requires login)
    Route::post('/reviews', [ReviewController::class, 'store']);
});

// Public reviews (viewing)
Route::get('/plants/{id}/reviews', [ReviewController::class, 'plantReviews']);

// Public blogs (learning)
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);

// Admin-only status update for orders + blog CRUD
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Blog admin CRUD
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{id}', [BlogController::class, 'update']);
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);
});