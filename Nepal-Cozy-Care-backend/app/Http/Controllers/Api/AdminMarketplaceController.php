<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendSellerApprovalEmail;
use App\Jobs\SendSellerRejectionEmail;
use App\Jobs\SendSellerVerificationEmail;
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
     * Directly create and assign a vendor shop to a user.
     */
    public function storeShop(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'establishment_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'is_verified' => 'boolean',
        ]);

        $user = User::findOrFail($validated['user_id']);

        $existing = Shop::where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json([
                'message' => "User '{$user->name}' already owns shop '{$existing->name}'.",
            ], 422);
        }

        $baseSlug = \Illuminate\Support\Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (Shop::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $admin = $request->user();

        $shop = Shop::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'city' => $validated['city'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? $user->email,
            'short_description' => $validated['short_description'] ?? null,
            'description' => $validated['description'] ?? null,
            'establishment_year' => $validated['establishment_year'] ?? date('Y'),
            'status' => Shop::STATUS_APPROVED,
            'is_verified' => $validated['is_verified'] ?? true,
            'approved_at' => now(),
            'approved_by' => $admin->id,
        ]);

        if (in_array($user->role, [User::ROLE_CUSTOMER, 'user'], true)) {
            $user->update(['role' => User::ROLE_SELLER]);
        }

        if ($shop->status === Shop::STATUS_APPROVED) {
            SendSellerApprovalEmail::dispatch($shop->id)->afterResponse();
        }
        if ($shop->is_verified) {
            SendSellerVerificationEmail::dispatch($shop->id)->afterResponse();
        }

        return response()->json([
            'message' => "Vendor shop '{$shop->name}' created and assigned to '{$user->name}' successfully.",
            'data' => [
                'shop' => $shop->fresh(['user', 'approvedBy']),
            ],
        ], 201);
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

        SendSellerApprovalEmail::dispatch($shop->id)->afterResponse();

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

        SendSellerRejectionEmail::dispatch($shop->id, $validated['reason'])->afterResponse();

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

        SendSellerApprovalEmail::dispatch($shop->id)->afterResponse();

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

        if ($shop->is_verified) {
            SendSellerVerificationEmail::dispatch($shop->id)->afterResponse();
        }

        return response()->json([
            'message' => $shop->is_verified ? "Shop '{$shop->name}' is now verified." : "Verification removed for '{$shop->name}'.",
            'data' => [
                'shop' => $shop->fresh(),
            ],
        ]);
    }

    /**
     * Update an existing shop's profile, logo, or banner (Admin).
     */
    public function updateShop(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:shops,slug,'.$shop->id,
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'establishment_year' => 'nullable|integer|min:1900|max:'.date('Y'),
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'website' => 'nullable|string|max:255',
            'is_verified' => 'nullable',
            'status' => 'nullable|string|in:pending,approved,suspended,rejected',
            'logo' => 'nullable',
            'banner' => 'nullable',
        ]);

        if (isset($validated['is_verified'])) {
            $validated['is_verified'] = filter_var($validated['is_verified'], FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('logo')) {
            $logoFile = $request->file('logo');
            $filename = time().'_logo_'.$logoFile->getClientOriginalName();
            $path = $logoFile->storeAs('shops/logos', $filename, 'public');
            $validated['logo'] = $path;
        }

        if ($request->hasFile('banner')) {
            $bannerFile = $request->file('banner');
            $filename = time().'_banner_'.$bannerFile->getClientOriginalName();
            $path = $bannerFile->storeAs('shops/banners', $filename, 'public');
            $validated['banner'] = $path;
        }

        $wasVerified = $shop->is_verified;
        $wasStatus = $shop->status;

        $shop->update($validated);
        $freshShop = $shop->fresh(['user', 'approvedBy']);

        if (! $wasVerified && $freshShop->is_verified) {
            SendSellerVerificationEmail::dispatch($freshShop->id)->afterResponse();
        }

        if ($wasStatus !== Shop::STATUS_APPROVED && $freshShop->status === Shop::STATUS_APPROVED) {
            SendSellerApprovalEmail::dispatch($freshShop->id)->afterResponse();
        }

        return response()->json([
            'message' => "Shop '{$freshShop->name}' updated successfully.",
            'data' => [
                'shop' => $freshShop,
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
