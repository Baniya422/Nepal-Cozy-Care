<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\Request;

class AdminMarketplaceController extends Controller
{
    /**
     * List all shops / seller applications.
     */
    public function shops(Request $request)
    {
        $query = Shop::with(['user:id,name,email', 'approvedBy:id,name'])
            ->withCount('plants');

        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('city', 'like', '%'.$search.'%')
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    });
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        $shops = $query->latest()->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'shops' => $shops->items(),
                'pagination' => [
                    'current_page' => $shops->currentPage(),
                    'per_page' => $shops->perPage(),
                    'total' => $shops->total(),
                    'last_page' => $shops->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Show a single shop and owner details.
     */
    public function showShop($id)
    {
        $shop = Shop::with(['user:id,name,email,created_at', 'approvedBy:id,name'])
            ->withCount('plants')
            ->findOrFail($id);

        return response()->json([
            'message' => null,
            'data' => [
                'shop' => $shop,
            ],
        ]);
    }

    /**
     * Approve a seller application.
     */
    public function approveShop(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);
        $admin = $request->user();

        $shop->update([
            'status' => Shop::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => $admin->id,
            'rejection_reason' => null,
        ]);

        // Elevate owner user role to seller if currently customer
        $owner = $shop->user;
        if ($owner && $owner->role === User::ROLE_CUSTOMER) {
            $owner->update(['role' => User::ROLE_SELLER]);
        }

        return response()->json([
            'message' => "Shop '{$shop->name}' has been approved and seller access granted.",
            'data' => [
                'shop' => $shop->fresh(['user', 'approvedBy']),
            ],
        ]);
    }

    /**
     * Reject a seller application.
     */
    public function rejectShop(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $shop = Shop::findOrFail($id);
        $shop->update([
            'status' => Shop::STATUS_REJECTED,
            'rejection_reason' => $validated['reason'],
        ]);

        return response()->json([
            'message' => "Shop '{$shop->name}' has been rejected.",
            'data' => [
                'shop' => $shop->fresh(),
            ],
        ]);
    }

    /**
     * Suspend an active shop.
     */
    public function suspendShop(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);

        // Prevent suspending default platform shop
        if ($shop->slug === 'nepal-cozy-care') {
            return response()->json([
                'message' => 'The default Nepal Cozy Care shop cannot be suspended.',
            ], 422);
        }

        $shop->update([
            'status' => Shop::STATUS_SUSPENDED,
        ]);

        return response()->json([
            'message' => "Shop '{$shop->name}' has been suspended.",
            'data' => [
                'shop' => $shop->fresh(),
            ],
        ]);
    }

    /**
     * Reactivate a suspended shop.
     */
    public function reactivateShop(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);
        $shop->update([
            'status' => Shop::STATUS_APPROVED,
        ]);

        return response()->json([
            'message' => "Shop '{$shop->name}' has been reactivated.",
            'data' => [
                'shop' => $shop->fresh(),
            ],
        ]);
    }

    /**
     * Toggle verification badge on a shop.
     */
    public function toggleVerifyShop(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);
        $shop->update([
            'is_verified' => ! $shop->is_verified,
        ]);

        return response()->json([
            'message' => $shop->is_verified ? "Shop '{$shop->name}' is now verified." : "Verification removed for '{$shop->name}'.",
            'data' => [
                'shop' => $shop->fresh(),
            ],
        ]);
    }

    /**
     * List all marketplace products for Super Admin oversight.
     */
    public function products(Request $request)
    {
        $query = Plant::with(['shop:id,name,slug,is_verified,status'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if ($shopId = $request->query('shop_id')) {
            $query->where('shop_id', $shopId);
        }

        if ($status = $request->query('approval_status')) {
            if ($status !== 'all') {
                $query->where('approval_status', $status);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%')
                    ->orWhereHas('shop', function ($sq) use ($search) {
                        $sq->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        $plants = $query->latest()->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'plants' => $plants->items(),
                'pagination' => [
                    'current_page' => $plants->currentPage(),
                    'per_page' => $plants->perPage(),
                    'total' => $plants->total(),
                    'last_page' => $plants->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Approve a marketplace product.
     */
    public function approveProduct(Request $request, $id)
    {
        $plant = Plant::findOrFail($id);
        $plant->update([
            'approval_status' => Plant::STATUS_APPROVED,
            'is_active' => true,
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => "Product '{$plant->name}' has been approved and published to the marketplace.",
            'data' => [
                'plant' => $plant->fresh('shop'),
            ],
        ]);
    }

    /**
     * Reject a marketplace product.
     */
    public function rejectProduct(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $plant = Plant::findOrFail($id);
        $plant->update([
            'approval_status' => Plant::STATUS_REJECTED,
            'rejection_reason' => $validated['reason'],
            'is_active' => false,
        ]);

        return response()->json([
            'message' => "Product '{$plant->name}' has been rejected.",
            'data' => [
                'plant' => $plant->fresh('shop'),
            ],
        ]);
    }
}
