<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlantRequest;
use App\Http\Requests\UpdatePlantRequest;
use App\Models\Plant;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    public function index(Request $request)
    {
        $query = Plant::query()
            ->where('is_active', true)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $includeAccessories = filter_var($request->query('include_accessories', false), FILTER_VALIDATE_BOOLEAN);
        
        if (!$includeAccessories) {
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
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('scientific_name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Sorting options
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

        // Attach avg_rating and review_count, hide raw aggregates
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

    // Show single plant
    public function show($id)
    {
        $plant = Plant::withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('is_active', true)
            ->findOrFail($id);

        // Increment views
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

    // Admin: create plant
    public function store(StorePlantRequest $request)
    {
        $data = $request->validated();
        
        // Handle is_active - convert to boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        } else {
            $data['is_active'] = true;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('plants', $filename, 'public');
            $data['image'] = $path;
        }
        
        $plant = Plant::create($data);

        return response()->json([
            'message' => 'Plant added successfully',
            'data' => [
                'plant' => $plant,
            ],
        ], 201);
    }

    // Admin: update plant
    public function update(UpdatePlantRequest $request, $id)
    {
        $plant = Plant::findOrFail($id);
        
        $data = $request->validated();
        
        // Handle is_active - convert to boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('plants', $filename, 'public');
            $data['image'] = $path;
        }

        $plant->update($data);

        return response()->json([
            'message' => 'Plant updated successfully',
            'data' => [
                'plant' => $plant,
            ],
        ]);
    }

    // Admin: delete plant
    public function destroy($id)
    {
        $plant = Plant::findOrFail($id);
        $plant->delete();

        return response()->json([
            'message' => 'Plant deleted successfully'
        ]);
    }

    // Admin: list all plants (including inactive) without filters
    public function adminIndex(Request $request)
    {
        $query = Plant::query()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $perPage = (int) $request->query('per_page', 100);
        $paginator = $query->paginate($perPage);

        // Attach avg_rating and review_count, hide raw aggregates
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

    // Public: get popular items (by views)
    public function popular(Request $request)
    {
        $query = Plant::mostViewed()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $perPage = (int) $request->query('per_page', 12);
        $paginator = $query->paginate($perPage);

        // Attach avg_rating and review_count, hide raw aggregates
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

    // Public: get best sellers (by total_sold)
    public function bestSellers(Request $request)
    {
        $query = Plant::bestSellers()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $perPage = (int) $request->query('per_page', 12);
        $paginator = $query->paginate($perPage);

        // Attach avg_rating and review_count, hide raw aggregates
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

    // Public: get popular items (from homepage category flag)
    public function popularItemsHomepage(Request $request)
    {
        $query = Plant::popularItems()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $perPage = (int) $request->query('per_page', 4);
        $paginator = $query->paginate($perPage);

        // Attach avg_rating and review_count, hide raw aggregates
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

    // Public: get shop plants (from homepage category flag)
    public function shopPlantsHomepage(Request $request)
    {
        $query = Plant::shopPlants()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $perPage = (int) $request->query('per_page', 4);
        $paginator = $query->paginate($perPage);

        // Attach avg_rating and review_count, hide raw aggregates
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

    // Public: get best sellers (from homepage category flag)
    public function bestSellersHomepage(Request $request)
    {
        $query = Plant::homepageBestSellers()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $perPage = (int) $request->query('per_page', 4);
        $paginator = $query->paginate($perPage);

        // Attach avg_rating and review_count, hide raw aggregates
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
}
