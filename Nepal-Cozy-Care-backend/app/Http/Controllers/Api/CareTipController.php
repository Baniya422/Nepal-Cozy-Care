<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareTip;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CareTipController extends Controller
{
    /**
     * Admin: Display a listing of all care tips (published and unpublished) for management.
     */
    public function adminIndex(Request $request)
    {
        $query = CareTip::with('author');
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%'.$request->search.'%')
                    ->orWhere('content', 'like', '%'.$request->search.'%');
            });
        }
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }
        if ($request->has('difficulty') && $request->difficulty) {
            $query->where('difficulty', $request->difficulty);
        }
        $query->orderBy('created_at', 'desc');

        $perPageParam = $request->get('per_page', 100);
        if ($perPageParam === 'all' || (int) $perPageParam <= 0) {
            $allTips = $query->get();
            return response()->json([
                'message' => null,
                'data' => [
                    'tips' => $allTips,
                    'data' => $allTips,
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => $allTips->count(),
                        'total' => $allTips->count(),
                        'last_page' => 1,
                    ],
                ],
            ]);
        }

        $perPage = max(1, min(500, (int) $perPageParam));
        $careTips = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'tips' => $careTips->items(),
                'data' => $careTips->items(),
                'pagination' => [
                    'current_page' => $careTips->currentPage(),
                    'per_page' => $careTips->perPage(),
                    'total' => $careTips->total(),
                    'last_page' => $careTips->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Display a listing of care tips with filters.
     */
    public function index(Request $request)
    {
        $query = CareTip::published()->with('author');
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }
        if ($request->has('difficulty') && $request->difficulty) {
            $query->byDifficulty($request->difficulty);
        }
        if ($request->has('plant_id') && $request->plant_id) {
            $query->byPlant($request->plant_id);
        }
        $sortBy = $request->get('sort_by', 'newest');
        switch ($sortBy) {
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            case 'oldest':
                $query->orderBy('published_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('published_at', 'desc');
                break;
        }
        $perPage = (int) $request->get('per_page', 12);
        if ($perPage > 100) $perPage = 100;
        if ($perPage < 1) $perPage = 12;
        $careTips = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => $careTips,
        ]);
    }

    /**
     * Display the specified care tip.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user();
        $query = CareTip::with('author');

        if (! $user || ! in_array($user->role ?? '', ['admin', 'seller'])) {
            $query->published();
        }

        $careTip = is_numeric($id)
            ? $query->where('id', (int) $id)->first()
            : $query->where('slug', $id)->first();

        if (! $careTip) {
            return response()->json([
                'message' => 'Care tip not found or not published.',
            ], 404);
        }

        $careTip->increment('views_count');
        $relatedTips = CareTip::published()
            ->where('id', '!=', $careTip->id)
            ->where(function ($q) use ($careTip) {
                $q->where('category', $careTip->category);
                if ($careTip->plant_ids) {
                    foreach ($careTip->plant_ids as $plantId) {
                        $q->orWhereJsonContains('plant_ids', $plantId);
                    }
                }
            })
            ->limit(4)
            ->get();

        $relatedProducts = [];
        if (! empty($careTip->plant_ids)) {
            $relatedProducts = Plant::whereIn('id', $careTip->plant_ids)
                ->where('is_approved', true)
                ->limit(8)
                ->get();
        }
        if (empty($relatedProducts) || (is_object($relatedProducts) && $relatedProducts->isEmpty())) {
            $fallbackQuery = Plant::where('is_approved', true);
            $cat = strtolower((string) $careTip->category);
            if ($cat === 'watering') {
                $fallbackQuery->where(function ($q) {
                    $q->where('category', 'like', '%water%')
                      ->orWhere('name', 'like', '%water%')
                      ->orWhere('name', 'like', '%spray%');
                });
            } elseif ($cat === 'fertilizing') {
                $fallbackQuery->where(function ($q) {
                    $q->where('category', 'like', '%fertiliz%')
                      ->orWhere('name', 'like', '%food%')
                      ->orWhere('name', 'like', '%nutrient%');
                });
            } elseif ($cat === 'pest_control') {
                $fallbackQuery->where(function ($q) {
                    $q->where('category', 'like', '%pest%')
                      ->orWhere('name', 'like', '%neem%')
                      ->orWhere('name', 'like', '%spray%');
                });
            } elseif ($cat === 'indoor' || $cat === 'soil') {
                $fallbackQuery->where(function ($q) {
                    $q->where('category', 'like', '%soil%')
                      ->orWhere('name', 'like', '%potting%')
                      ->orWhere('name', 'like', '%perlite%');
                });
            }
            $relatedProducts = $fallbackQuery->limit(6)->get();
            if ($relatedProducts->isEmpty()) {
                $relatedProducts = Plant::where('is_approved', true)->limit(4)->get();
            }
        }

        return response()->json([
            'message' => null,
            'data' => [
                'tip' => $careTip,
                'related_tips' => $relatedTips,
                'related_products' => $relatedProducts,
            ],
        ]);
    }

    /**
     * Get all categories.
     */
    public function categories()
    {
        return response()->json([
            'message' => null,
            'data' => CareTip::getCategories(),
        ]);
    }

    /**
     * Store a newly created care tip.
     */
    public function store(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => 'required|in:watering,fertilizing,pest_control,indoor,outdoor,seasonal',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'plant_ids' => 'nullable|array',
            'plant_ids.*' => 'exists:plants,id',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ];
        if ($request->hasFile('image')) {
            $rules['image'] = 'nullable|image|max:8192';
        } else {
            $rules['image'] = 'nullable|string';
        }
        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('care-tips', 'public');
        } elseif ($request->has('image')) {
            $img = $request->input('image');
            $validated['image'] = ($img !== null && trim((string)$img) !== '') ? trim((string)$img) : null;
        }

        $validated['slug'] = Str::slug($validated['title']);
        $validated['user_id'] = $request->user()?->id ?? 1;
        $count = CareTip::where('slug', 'like', $validated['slug'].'%')->count();
        if ($count > 0) {
            $validated['slug'] = $validated['slug'].'-'.($count + 1);
        }
        if (! isset($validated['published_at']) && ($validated['is_published'] ?? false)) {
            $validated['published_at'] = now();
        }
        $careTip = CareTip::create($validated);

        return response()->json([
            'message' => 'Care tip created successfully',
            'data' => $careTip->load('author'),
        ], 201);
    }

    /**
     * Update the specified care tip.
     */
    public function update(Request $request, $id)
    {
        $careTip = CareTip::findOrFail($id);
        $rules = [
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|string',
            'category' => 'sometimes|in:watering,fertilizing,pest_control,indoor,outdoor,seasonal',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'plant_ids' => 'nullable|array',
            'plant_ids.*' => 'exists:plants,id',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ];
        if ($request->hasFile('image')) {
            $rules['image'] = 'nullable|image|max:8192';
        } else {
            $rules['image'] = 'nullable|string';
        }
        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('care-tips', 'public');
        } elseif ($request->has('image')) {
            $img = $request->input('image');
            $validated['image'] = ($img !== null && trim((string)$img) !== '') ? trim((string)$img) : null;
        }

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $count = CareTip::where('slug', 'like', $validated['slug'].'%')
                ->where('id', '!=', $id)
                ->count();
            if ($count > 0) {
                $validated['slug'] = $validated['slug'].'-'.($count + 1);
            }
        }
        if (isset($validated['is_published']) && $validated['is_published'] && ! $careTip->published_at) {
            $validated['published_at'] = now();
        }
        $careTip->update($validated);

        return response()->json([
            'message' => 'Care tip updated successfully',
            'data' => $careTip->load('author'),
        ]);
    }

    /**
     * Remove the specified care tip.
     */
    public function destroy($id)
    {
        $careTip = CareTip::findOrFail($id);
        $careTip->delete();

        return response()->json([
            'message' => 'Care tip deleted successfully',
        ]);
    }
}
