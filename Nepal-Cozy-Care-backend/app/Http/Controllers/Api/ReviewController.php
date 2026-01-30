<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Plant;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Public: list reviews for a plant
    public function plantReviews(int $id)
    {
        $plant = Plant::where('is_active', true)->findOrFail($id);

        $query = Review::with('user:id,name')
            ->where('plant_id', $plant->id)
            ->latest();

        $perPage = (int) request()->query('per_page', 10);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'plant_id' => $plant->id,
                'reviews' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    // Auth: create or update a review for a plant
    public function store(StoreReviewRequest $request)
    {
        $validated = $request->validated();

        // ensure plant is active
        $plant = Plant::where('id', $validated['plant_id'])
            ->where('is_active', true)
            ->first();

        if (! $plant) {
            return response()->json([
                'message' => 'Plant not found or inactive',
                'errors' => [
                    'plant_id' => ['Plant not found or inactive'],
                ],
            ], 404);
        }

        $userId = $request->user()->id;

        $review = Review::updateOrCreate(
            [
                'user_id' => $userId,
                'plant_id' => $plant->id,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Review saved',
            'data' => [
                'review' => $review->load('user:id,name'),
            ],
        ], 201);
    }
}

