<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Plant;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SellerController extends Controller
{
    /**
     * Submit an application to become a seller / register a shop.
     */
    public function apply(Request $request)
    {
        $user = $request->user();

        // Check if user already owns a shop
        $existingShop = Shop::where('user_id', $user->id)->first();
        if ($existingShop) {
            if ($existingShop->status === Shop::STATUS_APPROVED) {
                return response()->json([
                    'message' => 'You already have an approved shop.',
                    'data' => ['shop' => $existingShop],
                ], 400);
            }
            if ($existingShop->status === Shop::STATUS_PENDING) {
                return response()->json([
                    'message' => 'Your seller application is already pending review.',
                    'data' => ['shop' => $existingShop],
                ], 400);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:shops,slug'.($existingShop ? ','.$existingShop->id : ''),
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'establishment_year' => 'nullable|integer|min:1900|max:'.date('Y'),
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'website' => 'nullable|string|max:255',
            'social_links' => 'nullable|array',
            'logo' => 'nullable',
            'banner' => 'nullable',
        ]);

        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;
            while (Shop::where('slug', $slug)->when($existingShop, fn ($q) => $q->where('id', '!=', $existingShop->id))->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Handle file uploads if uploaded as files
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

        $validated['status'] = Shop::STATUS_PENDING;
        $validated['rejection_reason'] = null;
        $validated['user_id'] = $user->id;

        if ($existingShop) {
            $existingShop->update($validated);
            $shop = $existingShop->fresh();
        } else {
            $shop = Shop::create($validated);
        }

        return response()->json([
            'message' => 'Seller application submitted successfully! It is now pending super admin approval.',
            'data' => [
                'shop' => $shop,
            ],
        ], 201);
    }

    /**
     * Get current user's seller/shop application status.
     */
    public function applicationStatus(Request $request)
    {
        $shop = Shop::where('user_id', $request->user()->id)->first();

        return response()->json([
            'message' => null,
            'data' => [
                'has_shop' => (bool) $shop,
                'shop' => $shop,
                'role' => $request->user()->role,
            ],
        ]);
    }

    /**
     * Get Seller Dashboard statistics.
     */
    public function dashboardStats(Request $request)
    {
        $shop = $this->resolveSellerShop($request);

        $totalProducts = Plant::where('shop_id', $shop->id)->count();
        $activeProducts = Plant::where('shop_id', $shop->id)
            ->where('is_active', true)
            ->where('approval_status', Plant::STATUS_APPROVED)
            ->count();
        $pendingProducts = Plant::where('shop_id', $shop->id)
            ->where('approval_status', Plant::STATUS_PENDING)
            ->count();
        $lowStockProducts = Plant::where('shop_id', $shop->id)
            ->where('stock', '<', 5)
            ->count();

        $orderItems = OrderItem::where('shop_id', $shop->id)->get();
        $totalOrders = $orderItems->pluck('order_id')->unique()->count();
        $totalSales = (float) $orderItems->sum('line_total');

        $recentItems = OrderItem::with(['order.user', 'plant'])
            ->where('shop_id', $shop->id)
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'product_name' => $item->product_name ?? $item->plant?->name ?? 'Product',
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'line_total' => (float) $item->line_total,
                    'status' => $item->order?->status ?? 'pending',
                    'created_at' => $item->created_at,
                    'customer_name' => $item->order?->shipping_name ?? $item->order?->user?->name ?? 'Customer',
                ];
            });

        return response()->json([
            'message' => null,
            'data' => [
                'stats' => [
                    'total_products' => $totalProducts,
                    'active_products' => $activeProducts,
                    'pending_products' => $pendingProducts,
                    'low_stock_products' => $lowStockProducts,
                    'total_orders' => $totalOrders,
                    'total_sales' => $totalSales,
                ],
                'shop' => $shop,
                'recent_orders' => $recentItems,
            ],
        ]);
    }

    /**
     * Get seller's own shop profile.
     */
    public function getShop(Request $request)
    {
        $shop = $this->resolveSellerShop($request);

        return response()->json([
            'message' => null,
            'data' => [
                'shop' => $shop,
            ],
        ]);
    }

    /**
     * Update seller's own shop profile.
     */
    public function updateShop(Request $request)
    {
        $shop = $this->resolveSellerShop($request);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'establishment_year' => 'nullable|integer|min:1900|max:'.date('Y'),
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:50',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'website' => 'nullable|string|max:255',
            'social_links' => 'nullable|array',
            'logo' => 'nullable',
            'banner' => 'nullable',
        ]);

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

        $shop->update($validated);

        return response()->json([
            'message' => 'Shop details updated successfully',
            'data' => [
                'shop' => $shop->fresh(),
            ],
        ]);
    }

    /**
     * List products owned by this seller.
     */
    public function products(Request $request)
    {
        $shop = $this->resolveSellerShop($request);

        $query = Plant::where('shop_id', $shop->id)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('approval_status', $status);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%')
                    ->orWhere('scientific_name', 'like', '%'.$search.'%');
            });
        }

        $sort = $request->query('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'stock_asc':
                $query->orderBy('stock', 'asc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $perPage = (int) $request->query('per_page', 12);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'plants' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Create a new product for this seller's shop.
     */
    public function storeProduct(Request $request)
    {
        $shop = $this->resolveSellerShop($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'size' => 'nullable|string|max:50',
            'difficulty' => 'nullable|string|max:50',
            'light' => 'nullable|string|max:100',
            'water' => 'nullable|string|max:100',
            'temperature' => 'nullable|string|max:100',
            'humidity' => 'nullable|string|max:100',
            'rooms' => 'nullable|array',
            'quantity_categories' => 'nullable|array',
            'fertilizer' => 'nullable|string',
            'soil' => 'nullable|string',
            'description' => 'required|string',
            'survival_guide' => 'nullable|string',
            'care_instructions' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable',
            'submit_for_review' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time().'_'.$image->getClientOriginalName();
            $path = $image->storeAs('plants', $filename, 'public');
            $validated['image'] = $path;
        }

        $submitForReview = filter_var($request->input('submit_for_review', true), FILTER_VALIDATE_BOOLEAN);

        $validated['shop_id'] = $shop->id;
        $validated['approval_status'] = $submitForReview ? Plant::STATUS_PENDING : Plant::STATUS_DRAFT;
        $validated['submitted_at'] = $submitForReview ? now() : null;
        $validated['is_active'] = false; // Only active once approved

        $plant = Plant::create($validated);

        return response()->json([
            'message' => $submitForReview
                ? 'Product submitted for super admin approval!'
                : 'Product saved as draft.',
            'data' => [
                'plant' => $plant,
            ],
        ], 201);
    }

    /**
     * Update an existing product owned by this seller.
     */
    public function updateProduct(Request $request, $id)
    {
        $shop = $this->resolveSellerShop($request);

        $plant = Plant::where('id', $id)
            ->where('shop_id', $shop->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'size' => 'nullable|string|max:50',
            'difficulty' => 'nullable|string|max:50',
            'light' => 'nullable|string|max:100',
            'water' => 'nullable|string|max:100',
            'temperature' => 'nullable|string|max:100',
            'humidity' => 'nullable|string|max:100',
            'rooms' => 'nullable|array',
            'quantity_categories' => 'nullable|array',
            'fertilizer' => 'nullable|string',
            'soil' => 'nullable|string',
            'description' => 'sometimes|required|string',
            'survival_guide' => 'nullable|string',
            'care_instructions' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'image' => 'nullable',
            'submit_for_review' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time().'_'.$image->getClientOriginalName();
            $path = $image->storeAs('plants', $filename, 'public');
            $validated['image'] = $path;
        }

        // If core details (name, price, category, description) change, resubmit for review
        if ($request->has('submit_for_review') || $request->has('name') || $request->has('price')) {
            $validated['approval_status'] = Plant::STATUS_PENDING;
            $validated['submitted_at'] = now();
            $validated['rejection_reason'] = null;
            $validated['is_active'] = false;
        }

        $plant->update($validated);

        return response()->json([
            'message' => 'Product updated successfully. If details were changed, it has been resubmitted for review.',
            'data' => [
                'plant' => $plant->fresh(),
            ],
        ]);
    }

    /**
     * Delete an existing product owned by this seller.
     */
    public function destroyProduct(Request $request, $id)
    {
        $shop = $this->resolveSellerShop($request);

        $plant = Plant::where('id', $id)
            ->where('shop_id', $shop->id)
            ->firstOrFail();

        $plant->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * List all order items belonging to this seller's shop.
     */
    public function orders(Request $request)
    {
        $shop = $this->resolveSellerShop($request);

        $query = OrderItem::with(['order.user', 'plant'])
            ->where('shop_id', $shop->id)
            ->latest();

        if ($status = $request->query('status')) {
            $query->whereHas('order', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        $items = $query->paginate($perPage);

        $transformed = $items->getCollection()->map(function ($item) {
            $order = $item->order;

            return [
                'id' => $item->id,
                'order_id' => $item->order_id,
                'product_id' => $item->plant_id,
                'product_name' => $item->product_name ?? $item->plant?->name ?? 'Unknown Product',
                'product_image' => $item->plant?->image,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'line_total' => (float) $item->line_total,
                'order_status' => $order?->status ?? 'pending',
                'payment_status' => $order?->payment_status ?? 'unpaid',
                'created_at' => $item->created_at,
                'shipping_name' => $order?->shipping_name,
                'shipping_phone' => $order?->shipping_phone,
                'shipping_city' => $order?->shipping_city,
                'shipping_address' => $order?->shipping_address,
            ];
        });

        return response()->json([
            'message' => null,
            'data' => [
                'order_items' => $transformed,
                'pagination' => [
                    'current_page' => $items->currentPage(),
                    'per_page' => $items->perPage(),
                    'total' => $items->total(),
                    'last_page' => $items->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Helper to resolve the authenticated user's shop with ownership security.
     */
    private function resolveSellerShop(Request $request): Shop
    {
        $user = $request->user();

        // If super admin and a shop_id header/param is passed, allow inspection
        if ($user->isSuperAdmin() && $request->has('admin_shop_id')) {
            return Shop::findOrFail($request->input('admin_shop_id'));
        }

        $shop = Shop::where('user_id', $user->id)->first();

        // If admin / super_admin doesn't have a personal shop record, fall back to default platform shop or first shop
        if (! $shop && ($user->isSuperAdmin() || in_array($user->role, ['admin', 'super_admin'], true))) {
            $shop = Shop::where('slug', 'nepal-cozy-care')->first() ?? Shop::first();
        }

        if (! $shop) {
            abort(403, 'No shop found for this account.');
        }

        return $shop;
    }
}
