<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminMarketplaceController;
use App\Http\Controllers\Api\AdminPageContentController;
use App\Http\Controllers\Api\AdminSettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CareTipController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\ContentTemplateController;
use App\Http\Controllers\Api\GardenEntryController;
use App\Http\Controllers\Api\HelpCenterTemplateController;
use App\Http\Controllers\Api\HomepageContentController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PlantController;
use App\Http\Controllers\Api\PlantFinderTemplateController;
use App\Http\Controllers\Api\PlantHealthAiController;
use App\Http\Controllers\Api\PlantHealthTemplateController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SeasonalReminderController;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Laravel API is connected!',
    ]);
});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleAuth']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/contact', [ContactMessageController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'update']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);
    Route::post('/upload', [UploadController::class, 'store']);
});
Route::get('/plants', [PlantController::class, 'index']);
Route::get('/plants/{id}', [PlantController::class, 'show']);
Route::get('/popular-items', [PlantController::class, 'popular']);
Route::get('/best-sellers', [PlantController::class, 'bestSellers']);
Route::get('/homepage/content', [HomepageContentController::class, 'show']);
Route::get('/homepage/popular-items', [PlantController::class, 'popularItemsHomepage']);
Route::get('/homepage/shop-plants', [PlantController::class, 'shopPlantsHomepage']);
Route::get('/homepage/best-sellers', [PlantController::class, 'bestSellersHomepage']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{plantId}', [WishlistController::class, 'destroy']);
    Route::get('/my-garden', [GardenEntryController::class, 'index']);
    Route::post('/my-garden', [GardenEntryController::class, 'store']);
    Route::put('/my-garden/{id}', [GardenEntryController::class, 'update']);
    Route::delete('/my-garden/{id}', [GardenEntryController::class, 'destroy']);
    Route::post('/my-garden/{id}/water', [GardenEntryController::class, 'markWatered']);
    Route::post('/my-garden/{id}/fertilize', [GardenEntryController::class, 'markFertilized']);
    Route::post('/reviews', [ReviewController::class, 'store']);
});
Route::get('/plants/{id}/reviews', [ReviewController::class, 'plantReviews']);
Route::post('/orders/track', [OrderController::class, 'track']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::get('/top-trends', [BlogController::class, 'topTrends']);
Route::get('/top-stories', [BlogController::class, 'topStories']);
Route::get('/care-tips', [CareTipController::class, 'index']);
Route::get('/care-tips/categories', [CareTipController::class, 'categories']);
Route::get('/care-tips/{id}', [CareTipController::class, 'show']);
Route::get('/seasonal-reminders/current', [SeasonalReminderController::class, 'current']);
Route::get('/content-templates/{key}', [ContentTemplateController::class, 'show']);
Route::get('/help-center/template', [HelpCenterTemplateController::class, 'show']);
Route::get('/plant-finder/template', [PlantFinderTemplateController::class, 'show']);
Route::get('/plant-health/template', [PlantHealthTemplateController::class, 'show']);
Route::post('/plant-health/ai-diagnose', [PlantHealthAiController::class, 'diagnose']);
// Public Shop Marketplace Routes
Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{slug}', [ShopController::class, 'show']);
Route::get('/shops/{slug}/plants', [ShopController::class, 'plants']);

// Seller Application Routes (Authenticated Customers / Users)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/seller/apply', [SellerController::class, 'apply']);
    Route::get('/seller/application-status', [SellerController::class, 'applicationStatus']);
});

// Seller Portal Routes (Protected by auth:sanctum and seller middleware)
Route::middleware(['auth:sanctum', 'seller'])->group(function () {
    Route::get('/seller/dashboard/stats', [SellerController::class, 'dashboardStats']);
    Route::get('/seller/shop', [SellerController::class, 'getShop']);
    Route::put('/seller/shop', [SellerController::class, 'updateShop']);
    Route::post('/seller/shop', [SellerController::class, 'updateShop']); // supports multipart
    Route::get('/seller/products', [SellerController::class, 'products']);
    Route::post('/seller/products', [SellerController::class, 'storeProduct']);
    Route::put('/seller/products/{id}', [SellerController::class, 'updateProduct']);
    Route::post('/seller/products/{id}', [SellerController::class, 'updateProduct']); // supports multipart
    Route::delete('/seller/products/{id}', [SellerController::class, 'destroyProduct']);
    Route::get('/seller/orders', [SellerController::class, 'orders']);

    // Vendor Blogs & Care Tips
    Route::get('/seller/blogs', [SellerController::class, 'blogs']);
    Route::post('/seller/blogs', [SellerController::class, 'storeBlog']);
    Route::put('/seller/blogs/{id}', [SellerController::class, 'updateBlog']);
    Route::post('/seller/blogs/{id}', [SellerController::class, 'updateBlog']); // multipart
    Route::delete('/seller/blogs/{id}', [SellerController::class, 'destroyBlog']);

    Route::get('/seller/care-tips', [SellerController::class, 'careTips']);
    Route::post('/seller/care-tips', [SellerController::class, 'storeCareTip']);
    Route::put('/seller/care-tips/{id}', [SellerController::class, 'updateCareTip']);
    Route::post('/seller/care-tips/{id}', [SellerController::class, 'updateCareTip']); // multipart
    Route::delete('/seller/care-tips/{id}', [SellerController::class, 'destroyCareTip']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/homepage', [HomepageContentController::class, 'adminShow']);
    Route::put('/admin/homepage', [HomepageContentController::class, 'update']);
    Route::get('/admin/page-content', [AdminPageContentController::class, 'index']);
    Route::put('/admin/page-content/{key}', [AdminPageContentController::class, 'update']);
    Route::get('/admin/settings', [AdminSettingsController::class, 'show']);
    Route::put('/admin/settings/mail', [AdminSettingsController::class, 'updateMail']);
    Route::post('/admin/settings/mail/test', [AdminSettingsController::class, 'testMail']);
    Route::get('/admin/dashboard/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/admin/dashboard/recent-orders', [AdminController::class, 'recentOrders']);
    Route::get('/admin/dashboard/top-products', [AdminController::class, 'topProducts']);
    Route::get('/admin/reports', [AdminController::class, 'reports']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::put('/admin/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::get('/admin/plants', [PlantController::class, 'adminIndex']);
    Route::post('/plants', [PlantController::class, 'store']);
    Route::put('/plants/{id}', [PlantController::class, 'update']);
    Route::delete('/plants/{id}', [PlantController::class, 'destroy']);
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/confirmation', [OrderController::class, 'updateConfirmation']);
    Route::get('/admin/garden-entries', [GardenEntryController::class, 'adminIndex']);
    Route::get('/admin/blogs', [BlogController::class, 'adminIndex']);
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{id}', [BlogController::class, 'update']);
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);
    Route::get('/admin/care-tips', [CareTipController::class, 'adminIndex']);
    Route::post('/care-tips', [CareTipController::class, 'store']);
    Route::put('/care-tips/{id}', [CareTipController::class, 'update']);
    Route::delete('/care-tips/{id}', [CareTipController::class, 'destroy']);
    Route::get('/admin/seasonal-reminders', [SeasonalReminderController::class, 'adminIndex']);
    Route::post('/seasonal-reminders', [SeasonalReminderController::class, 'store']);
    Route::put('/seasonal-reminders/{id}', [SeasonalReminderController::class, 'update']);
    Route::delete('/seasonal-reminders/{id}', [SeasonalReminderController::class, 'destroy']);
    Route::get('/admin/contact-messages', [ContactMessageController::class, 'adminIndex']);
    Route::put('/contact-messages/{id}/status', [ContactMessageController::class, 'updateStatus']);
    Route::delete('/contact-messages/{id}', [ContactMessageController::class, 'destroy']);

    // Super Admin Marketplace Management
    Route::get('/admin/shops', [AdminMarketplaceController::class, 'shops']);
    Route::post('/admin/shops', [AdminMarketplaceController::class, 'storeShop']);
    Route::get('/admin/shops/{id}', [AdminMarketplaceController::class, 'showShop']);
    Route::post('/admin/shops/{id}/approve', [AdminMarketplaceController::class, 'approveShop']);
    Route::post('/admin/shops/{id}/reject', [AdminMarketplaceController::class, 'rejectShop']);
    Route::post('/admin/shops/{id}/suspend', [AdminMarketplaceController::class, 'suspendShop']);
    Route::post('/admin/shops/{id}/reactivate', [AdminMarketplaceController::class, 'reactivateShop']);
    Route::post('/admin/shops/{id}/verify', [AdminMarketplaceController::class, 'toggleVerifyShop']);
    Route::get('/admin/marketplace/products', [AdminMarketplaceController::class, 'products']);
    Route::post('/admin/marketplace/products/{id}/approve', [AdminMarketplaceController::class, 'approveProduct']);
    Route::post('/admin/marketplace/products/{id}/reject', [AdminMarketplaceController::class, 'rejectProduct']);
});
