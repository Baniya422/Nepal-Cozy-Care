<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlantRequest;
use App\Http\Requests\UpdatePlantRequest;
use App\Models\Plant;
use App\Models\Shop;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PlantController extends Controller
{
    public function __construct(
        protected ImageCompressionService $imageCompressionService
    ) {}

    public function index(Request $request)
    {
        $query = Plant::query()->marketplaceApproved();

        if ($request->query('view') === 'listing') {
            $query->select([
                'id', 'shop_id', 'name', 'scientific_name', 'category', 'size',
                'difficulty', 'light', 'water', 'rooms', 'price', 'stock', 'image',
                'is_active', 'views', 'total_sold', 'is_best_seller', 'created_at',
            ]);
        }

        $query->with('shop:id,name,slug,logo,is_verified,city,status')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if ($shopId = $request->query('shop_id')) {
            $query->where('shop_id', $shopId);
        }

        if ($shopSlug = $request->query('shop_slug')) {
            $query->whereHas('shop', function ($q) use ($shopSlug) {
                $q->where('slug', $shopSlug);
            });
        }
        $includeAccessories = filter_var($request->query('include_accessories', false), FILTER_VALIDATE_BOOLEAN);
        if (! $includeAccessories) {
            $query->excludeAccessories();
        }
        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }
        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }
        if ($light = $request->query('light')) {
            $query->where('light', $light);
        }
        if ($water = $request->query('water')) {
            $query->where('water', $water);
        }
        if ($minPrice = $request->query('min_price')) {
            $query->where('price', '>=', (float) $minPrice);
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', (float) $maxPrice);
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
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    public function show($id)
    {
        $plant = Plant::with('shop:id,name,slug,logo,banner,short_description,city,address,phone,email,is_verified,status')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('is_active', true)
            ->findOrFail($id);
        $plant->incrementViews();
        $plant->avg_rating = round((float) ($plant->reviews_avg_rating ?? 0), 1);
        $plant->review_count = (int) ($plant->reviews_count ?? 0);
        unset($plant->reviews_avg_rating, $plant->reviews_count);

        return response()->json([
            'message' => null,
            'data' => [
                'plant' => $plant,
            ],
        ]);
    }

    public function store(StorePlantRequest $request)
    {
        $data = $request->validated();
        if (isset($data['is_active'])) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        } else {
            $data['is_active'] = true;
        }
        if ($request->hasFile('image')) {
            $data['image'] = $this->imageCompressionService->store(
                $request->file('image'),
                'plants',
                1200,
                1200,
                78
            );
        }

        if (empty($data['shop_id'])) {
            $defaultShop = Shop::where('slug', 'nepal-cozy-care')->first();
            $data['shop_id'] = $defaultShop?->id;
        }
        $data['approval_status'] = Plant::STATUS_APPROVED;

        $plant = Plant::create($data);

        return response()->json([
            'message' => 'Plant added successfully',
            'data' => [
                'plant' => $plant->load('shop'),
            ],
        ], 201);
    }

    public function update(UpdatePlantRequest $request, $id)
    {
        $plant = Plant::findOrFail($id);
        $data = $request->validated();
        if (isset($data['is_active'])) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->hasFile('image')) {
            $data['image'] = $this->imageCompressionService->store(
                $request->file('image'),
                'plants',
                1200,
                1200,
                78
            );
        }
        $plant->update($data);

        return response()->json([
            'message' => 'Plant updated successfully',
            'data' => [
                'plant' => $plant,
            ],
        ]);
    }

    public function destroy($id)
    {
        $plant = Plant::findOrFail($id);
        $plant->delete();

        return response()->json([
            'message' => 'Plant deleted successfully',
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = Plant::query()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');
        $perPage = (int) $request->query('per_page', 100);
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

    public function popular(Request $request)
    {
        $query = Plant::mostViewed()
            ->marketplaceApproved()
            ->with('shop:id,name,slug,logo,is_verified,city,status')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');
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
                'data' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    public function bestSellers(Request $request)
    {
        $query = Plant::bestSellers()
            ->marketplaceApproved()
            ->with('shop:id,name,slug,logo,is_verified,city,status')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');
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
                'data' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    public function popularItemsHomepage(Request $request)
    {
        $perPage = (int) $request->query('per_page', 4);
        $cacheKey = 'homepage_popular_items_'.$perPage;

        $data = Cache::remember($cacheKey, 300, function () use ($perPage) {
            $query = Plant::popularItems()
                ->marketplaceApproved()
                ->with('shop:id,name,slug,logo,is_verified,city,status')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews');

            $paginator = $query->paginate($perPage);
            $paginator->getCollection()->transform(function ($plant) {
                $plant->avg_rating = round((float) ($plant->reviews_avg_rating ?? 0), 1);
                $plant->review_count = (int) ($plant->reviews_count ?? 0);
                unset($plant->reviews_avg_rating, $plant->reviews_count);

                return $plant;
            });

            return [
                'data' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ];
        });

        return response()->json([
            'message' => null,
            'data' => $data,
        ])->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    }

    public function shopPlantsHomepage(Request $request)
    {
        $perPage = (int) $request->query('per_page', 4);
        $cacheKey = 'homepage_shop_plants_'.$perPage;

        $data = Cache::remember($cacheKey, 300, function () use ($perPage) {
            $query = Plant::shopPlants()
                ->marketplaceApproved()
                ->with('shop:id,name,slug,logo,is_verified,city,status')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews');

            $paginator = $query->paginate($perPage);
            $paginator->getCollection()->transform(function ($plant) {
                $plant->avg_rating = round((float) ($plant->reviews_avg_rating ?? 0), 1);
                $plant->review_count = (int) ($plant->reviews_count ?? 0);
                unset($plant->reviews_avg_rating, $plant->reviews_count);

                return $plant;
            });

            return [
                'data' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ];
        });

        return response()->json([
            'message' => null,
            'data' => $data,
        ])->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    }

    public function bestSellersHomepage(Request $request)
    {
        $perPage = (int) $request->query('per_page', 4);
        $cacheKey = 'homepage_best_sellers_'.$perPage;

        $data = Cache::remember($cacheKey, 300, function () use ($perPage) {
            $query = Plant::homepageBestSellers()
                ->marketplaceApproved()
                ->with('shop:id,name,slug,logo,is_verified,city,status')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews');

            $paginator = $query->paginate($perPage);
            $paginator->getCollection()->transform(function ($plant) {
                $plant->avg_rating = round((float) ($plant->reviews_avg_rating ?? 0), 1);
                $plant->review_count = (int) ($plant->reviews_count ?? 0);
                unset($plant->reviews_avg_rating, $plant->reviews_count);

                return $plant;
            });

            return [
                'data' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ];
        });

        return response()->json([
            'message' => null,
            'data' => $data,
        ])->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    }
}
