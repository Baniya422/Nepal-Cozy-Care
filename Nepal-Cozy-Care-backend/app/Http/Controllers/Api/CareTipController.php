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

        // Search filter
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Difficulty filter
        if ($request->has('difficulty') && $request->difficulty) {
            $query->where('difficulty', $request->difficulty);
        }

        // Sorting
        $query->orderBy('created_at', 'desc');

        $careTips = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'message' => null,
            'data' => [
                'tips' => $careTips->items(),
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

        // Search filter
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }

        // Difficulty filter
        if ($request->has('difficulty') && $request->difficulty) {
            $query->byDifficulty($request->difficulty);
        }

        // Plant filter
        if ($request->has('plant_id') && $request->plant_id) {
            $query->byPlant($request->plant_id);
        }

        // Sorting
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

        $careTips = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'message' => null,
            'data' => $careTips,
        ]);
    }

    /**
     * Display the specified care tip.
     */
    public function show($id)
    {
        $careTip = CareTip::published()->with('author')->findOrFail($id);

        // Increment views
        $careTip->increment('views_count');

        // Get related tips (same category or related plants)
        $relatedTips = CareTip::published()
            ->where('id', '!=', $careTip->id)
            ->where(function ($query) use ($careTip) {
                $query->where('category', $careTip->category);
                if ($careTip->plant_ids) {
                    foreach ($careTip->plant_ids as $plantId) {
                        $query->orWhereJsonContains('plant_ids', $plantId);
                    }
                }
            })
            ->limit(4)
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'tip' => $careTip,
                'related_tips' => $relatedTips,
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'image' => 'nullable|string',
            'category' => 'required|in:watering,fertilizing,pest_control,indoor,outdoor,seasonal',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'plant_ids' => 'nullable|array',
            'plant_ids.*' => 'exists:plants,id',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['user_id'] = $request->user()->id;

        // Check for duplicate slug
        $count = CareTip::where('slug', 'like', $validated['slug'] . '%')->count();
        if ($count > 0) {
            $validated['slug'] = $validated['slug'] . '-' . ($count + 1);
        }

        if (!isset($validated['published_at']) && $validated['is_published']) {
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

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|string',
            'image' => 'nullable|string',
            'category' => 'sometimes|in:watering,fertilizing,pest_control,indoor,outdoor,seasonal',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'plant_ids' => 'nullable|array',
            'plant_ids.*' => 'exists:plants,id',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Check for duplicate slug (excluding current)
            $count = CareTip::where('slug', 'like', $validated['slug'] . '%')
                ->where('id', '!=', $id)
                ->count();
            if ($count > 0) {
                $validated['slug'] = $validated['slug'] . '-' . ($count + 1);
            }
        }

        if (isset($validated['is_published']) && $validated['is_published'] && !$careTip->published_at) {
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
