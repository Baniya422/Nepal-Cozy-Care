<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlantController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;

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

// Plant routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/plants', [PlantController::class, 'store']);      // this create plant 
    Route::get('/plants', [PlantController::class, 'index']);       // this list all active plants
    Route::get('/plants/{id}', [PlantController::class, 'show']);   // this single plant
    Route::put('/plants/{id}', [PlantController::class, 'update']); //  this update plant
    Route::delete('/plants/{id}', [PlantController::class, 'destroy']); // this delete plant
});
// Cart routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);        // view cart
    Route::post('/cart', [CartController::class, 'store']);       // add item
    Route::put('/cart/{id}', [CartController::class, 'update']);  // update quantity
    Route::delete('/cart/{id}', [CartController::class, 'destroy']); // remove item
    Route::delete('/cart', [CartController::class, 'clear']);     // clear cart
});
// Order routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

// Admin-only status update for orders
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});