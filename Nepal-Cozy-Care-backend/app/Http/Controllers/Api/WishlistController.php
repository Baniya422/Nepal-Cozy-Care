<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    // List current user's wishlist with plant details
    public function index(Request $request)
    {
        $items = Wishlist::with('plant')
            ->where('user_id', $request->user()->id)
            ->whereHas('plant', function ($query) {
                $query->where('is_active', true);
            })
            ->latest()
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'wishlist' => $items,
            ],
        ]);
    }

    // Add a plant to the current user's wishlist
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plant_id' => ['required', 'exists:plants,id'],
        ]);

        $userId = $request->user()->id;
        $plantId = $validated['plant_id'];

        // Optional: ensure plant exists and is active
        $plant = Plant::where('id', $plantId)
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

        $wishlistItem = Wishlist::firstOrCreate(
            [
                'user_id' => $userId,
                'plant_id' => $plantId,
            ]
        );

        return response()->json([
            'message' => 'Added to wishlist',
            'data' => [
                'item' => $wishlistItem->load('plant'),
            ],
        ], 201);
    }

    // Remove a plant from the current user's wishlist
    // Route uses the plant id for convenience: DELETE /wishlist/{plantId}
    public function destroy(Request $request, int $plantId)
    {
        $deleted = Wishlist::where('user_id', $request->user()->id)
            ->where('plant_id', $plantId)
            ->delete();

        if (! $deleted) {
            return response()->json([
                'message' => 'Wishlist item not found',
                'errors' => [],
            ], 404);
        }

        return response()->json([
            'message' => 'Removed from wishlist',
            'data' => null,
        ]);
    }
}

