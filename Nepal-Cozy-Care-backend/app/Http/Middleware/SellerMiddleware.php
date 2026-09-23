<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (! \App\Models\AdminSetting::current()->vendor_marketplace_enabled) {
            return response()->json([
                'message' => 'Vendor marketplace features are currently disabled.',
            ], 403);
        }

        // Must be seller (or super admin testing/managing)
        if (! in_array($user->role, ['seller', 'super_admin', 'admin'], true)) {
            return response()->json([
                'message' => 'Forbidden. Seller account required.',
            ], 403);
        }

        // If user is a seller, verify shop status
        if ($user->role === 'seller') {
            $shop = $user->shop;

            if (! $shop) {
                return response()->json([
                    'message' => 'No shop associated with this seller account.',
                ], 403);
            }

            if ($shop->status === Shop::STATUS_SUSPENDED) {
                return response()->json([
                    'message' => 'Your shop has been suspended. Please contact support.',
                ], 403);
            }

            if ($shop->status === Shop::STATUS_REJECTED) {
                return response()->json([
                    'message' => 'Your seller application was rejected. Reason: '.($shop->rejection_reason ?? 'Not specified'),
                ], 403);
            }

            if ($shop->status === Shop::STATUS_PENDING) {
                return response()->json([
                    'message' => 'Your shop application is currently pending super admin approval.',
                ], 403);
            }
        }

        return $next($request);
    }
}
