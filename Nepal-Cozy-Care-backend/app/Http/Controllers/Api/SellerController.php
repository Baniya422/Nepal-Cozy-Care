<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\CareTip;
use App\Models\OrderItem;
use App\Models\Plant;
use App\Models\Shop;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SellerController extends Controller
{
    public function __construct(
        protected ImageCompressionService $imageCompressionService
    ) {}

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
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:5120',
            'submit_for_review' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->imageCompressionService->store(
                $request->file('image'),
                'plants',
                1200,
                1200,
                78
            );
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
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:5120',
            'submit_for_review' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->imageCompressionService->store(
                $request->file('image'),
                'plants',
                1200,
                1200,
                78
            );
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

    /**
     * List blogs authored by this seller.
     */
    public function blogs(Request $request)
    {
        $shop = $this->resolveSellerShop($request);
        $user = $request->user();

        $query = Blog::query()
            ->where(function ($q) use ($user, $shop) {
                $q->where('user_id', $user->id)
                  ->orWhere('author', $shop->name);
            })
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')
                  ->orWhere('content', 'like', '%'.$search.'%');
            });
        }

        $perPage = (int) $request->query('per_page', 20);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'blogs' => $paginator->items(),
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
     * Store a new blog authored by the vendor.
     */
    public function storeBlog(Request $request)
    {
        $shop = $this->resolveSellerShop($request);
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => 'nullable|string|max:100',
            'image' => 'nullable',
            'is_published' => 'nullable|boolean',
        ]);

        $slug = Str::slug($validated['title']);
        if (Blog::where('slug', $slug)->exists()) {
            $slug = $slug.'-'.Str::random(6);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'_blog_'.$file->getClientOriginalName();
            $path = $file->storeAs('blogs', $filename, 'public');
            $validated['image'] = $path;
        }

        $isPublished = (bool) ($validated['is_published'] ?? true);

        $blog = Blog::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'image' => $validated['image'] ?? null,
            'author' => $shop->name ?? $user->name,
            'category' => $validated['category'] ?? 'Nursery Care',
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);

        return response()->json([
            'message' => 'Nursery blog article published successfully!',
            'data' => ['blog' => $blog],
        ], 201);
    }

    /**
     * Update an existing blog article.
     */
    public function updateBlog(Request $request, $id)
    {
        $user = $request->user();
        $blog = Blog::where('id', $id)
            ->where(function ($q) use ($user) {
                if (! $user->isSuperAdmin()) {
                    $q->where('user_id', $user->id);
                }
            })
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|string',
            'category' => 'nullable|string|max:100',
            'image' => 'nullable',
            'is_published' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'_blog_'.$file->getClientOriginalName();
            $path = $file->storeAs('blogs', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['is_published'])) {
            $isPublished = (bool) $validated['is_published'];
            if ($isPublished && ! $blog->published_at) {
                $validated['published_at'] = now();
            }
        }

        $blog->update($validated);

        return response()->json([
            'message' => 'Blog article updated successfully!',
            'data' => ['blog' => $blog->fresh()],
        ]);
    }

    /**
     * Delete an existing blog article.
     */
    public function destroyBlog(Request $request, $id)
    {
        $user = $request->user();
        $blog = Blog::where('id', $id)
            ->where(function ($q) use ($user) {
                if (! $user->isSuperAdmin()) {
                    $q->where('user_id', $user->id);
                }
            })
            ->firstOrFail();

        $blog->delete();

        return response()->json([
            'message' => 'Blog article removed successfully.',
        ]);
    }

    /**
     * List care tips authored by this seller.
     */
    public function careTips(Request $request)
    {
        $user = $request->user();

        $query = CareTip::query()
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')
                  ->orWhere('content', 'like', '%'.$search.'%');
            });
        }

        $perPage = (int) $request->query('per_page', 20);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'tips' => $paginator->items(),
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
     * Store a new care tip authored by the vendor.
     */
    public function storeCareTip(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => 'required|in:watering,fertilizing,pest_control,indoor,outdoor,seasonal',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'image' => 'nullable',
            'is_published' => 'nullable|boolean',
        ]);

        $slug = Str::slug($validated['title']);
        if (CareTip::where('slug', $slug)->exists()) {
            $slug = $slug.'-'.Str::random(6);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'_care_'.$file->getClientOriginalName();
            $path = $file->storeAs('care-tips', $filename, 'public');
            $validated['image'] = $path;
        }

        $isPublished = (bool) ($validated['is_published'] ?? true);

        $careTip = CareTip::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'category' => $validated['category'],
            'difficulty' => $validated['difficulty'],
            'image' => $validated['image'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);

        return response()->json([
            'message' => 'Plant care tip published successfully!',
            'data' => ['care_tip' => $careTip],
        ], 201);
    }

    /**
     * Update an existing care tip.
     */
    public function updateCareTip(Request $request, $id)
    {
        $user = $request->user();
        $careTip = CareTip::where('id', $id)
            ->where(function ($q) use ($user) {
                if (! $user->isSuperAdmin()) {
                    $q->where('user_id', $user->id);
                }
            })
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|string',
            'category' => 'sometimes|in:watering,fertilizing,pest_control,indoor,outdoor,seasonal',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'image' => 'nullable',
            'is_published' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'_care_'.$file->getClientOriginalName();
            $path = $file->storeAs('care-tips', $filename, 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['is_published'])) {
            $isPublished = (bool) $validated['is_published'];
            if ($isPublished && ! $careTip->published_at) {
                $validated['published_at'] = now();
            }
        }

        $careTip->update($validated);

        return response()->json([
            'message' => 'Care tip updated successfully!',
            'data' => ['care_tip' => $careTip->fresh()],
        ]);
    }

    /**
     * Delete an existing care tip.
     */
    public function destroyCareTip(Request $request, $id)
    {
        $user = $request->user();
        $careTip = CareTip::where('id', $id)
            ->where(function ($q) use ($user) {
                if (! $user->isSuperAdmin()) {
                    $q->where('user_id', $user->id);
                }
            })
            ->firstOrFail();

        $careTip->delete();

        return response()->json([
            'message' => 'Care tip removed successfully.',
        ]);
    }
}
