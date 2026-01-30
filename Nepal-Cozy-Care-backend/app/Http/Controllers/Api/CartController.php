<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartRequest;
use App\Http\Requests\UpdateCartRequest;
use App\Models\Cart;
use App\Models\Plant;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // Get user's cart
    public function index(Request $request)
    {
        $cartItems = Cart::with('plant')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $total = $cartItems->sum(function ($item) {
            return ($item->plant?->price ?? 0) * $item->quantity;
        });

        return response()->json([
            'message' => null,
            'data' => [
                'cart' => $cartItems,
                'total' => $total,
            ],
        ]);
    }

    // Add to cart
    public function store(StoreCartRequest $request)
    {
        $qty = (int) ($request->quantity ?? 1);
        $plant = Plant::findOrFail($request->plant_id);

        // stock check for requested qty
        if ($plant->stock < $qty) {
            return response()->json([
                'message' => 'Not enough stock',
                'errors' => [
                    'quantity' => ['Not enough stock'],
                ],
            ], 400);
        }

        // already in cart?
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('plant_id', $plant->id)
            ->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $qty;

            // stock check for new total qty
            if ($plant->stock < $newQty) {
                return response()->json([
                    'message' => 'Not enough stock for requested quantity',
                    'errors' => [
                        'quantity' => ['Not enough stock for requested quantity'],
                    ],
                ], 400);
            }

            $cartItem->quantity = $newQty;
            $cartItem->save();
        } else {
            $cartItem = Cart::create([
                'user_id' => $request->user()->id,
                'plant_id' => $plant->id,
                'quantity' => $qty
            ]);
        }

        return response()->json([
            'message' => 'Added to cart',
            'data' => [
                'cart' => $cartItem->load('plant'),
            ],
        ], 201);
    }

    // Update quantity
    public function update(UpdateCartRequest $request, $id)
    {
        $qty = (int) $request->quantity;

        $cartItem = Cart::with('plant')
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        // stock check
        if ($cartItem->plant->stock < $qty) {
            return response()->json([
                'message' => 'Not enough stock',
                'errors' => [
                    'quantity' => ['Not enough stock'],
                ],
            ], 400);
        }

        $cartItem->quantity = $qty;
        $cartItem->save();

        return response()->json([
            'message' => 'Cart updated',
            'data' => [
                'cart' => $cartItem->load('plant'),
            ],
        ]);
    }

    // Remove from cart
    public function destroy(Request $request, $id)
    {
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json(['message' => 'Removed from cart']);
    }

    // Clear entire cart
    public function clear(Request $request)
    {
        Cart::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Cart cleared',
            'data' => null,
        ]);
    }
}
