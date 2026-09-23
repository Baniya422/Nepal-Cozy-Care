<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        if (! \App\Models\AdminSetting::current()->vendor_marketplace_enabled) {
            return response()->json([
                'message' => 'Partner shops directory is currently unavailable.',
            ], 404);
        }

        $query = Shop::approved()
            ->withCount(['plants' => function ($q) {
                $q->where('is_active', true)
                    ->where(function ($sub) {
                        $sub->where('approval_status', Plant::STATUS_APPROVED)
                            ->orWhereNull('approval_status');
                    });
            }]);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('city', 'like', '%'.$search.'%')
                    ->orWhere('short_description', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        if ($city = $request->query('city')) {
            $query->where('city', $city);
        }

        if ($request->has('verified')) {
            $query->where('is_verified', filter_var($request->query('verified'), FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $request->query('sort', 'newest');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'products_desc':
                $query->orderBy('plants_count', 'desc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $perPage = (int) $request->query('per_page', 12);
        $shops = $query->paginate($perPage);

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

    public function show(string $slug)
    {
        if (! \App\Models\AdminSetting::current()->vendor_marketplace_enabled) {
            return response()->json([
                'message' => 'Partner shop is currently unavailable.',
            ], 404);
        }

        $shop = Shop::where('slug', $slug)
            ->where('status', Shop::STATUS_APPROVED)
            ->withCount(['plants' => function ($q) {
                $q->where('is_active', true)
                    ->where(function ($sub) {
                        $sub->where('approval_status', Plant::STATUS_APPROVED)
                            ->orWhereNull('approval_status');
                    });
            }])
            ->firstOrFail();

        return response()->json([
            'message' => null,
            'data' => [
                'shop' => $shop,
            ],
        ]);
    }

    public function plants(string $slug, Request $request)
    {
        if (! \App\Models\AdminSetting::current()->vendor_marketplace_enabled) {
            return response()->json([
                'message' => 'Partner shop plants are currently unavailable.',
            ], 404);
        }

        $shop = Shop::where('slug', $slug)
            ->where('status', Shop::STATUS_APPROVED)
            ->firstOrFail();

        $query = Plant::query()
            ->where('shop_id', $shop->id)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('approval_status', Plant::STATUS_APPROVED)
                    ->orWhereNull('approval_status');
            })
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->with('shop:id,name,slug,logo,is_verified,city,status');

        $includeAccessories = filter_var($request->query('include_accessories', false), FILTER_VALIDATE_BOOLEAN);
        if (! $includeAccessories) {
            $query->excludeAccessories();
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('scientific_name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
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
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $perPage = (int) $request->query('per_page', 12);
        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->transform(function ($plant) {
            $plant->avg_rating = round((float) ($plant->reviews_avg_rating ?? 0), 1);
            $plant->review_count = (int) ($plant->reviews_count ?? 0);
            unset($plant->reviews_avg_rating, $plant->reviews_count);

            return $plant;
        });

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
}
