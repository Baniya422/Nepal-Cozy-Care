<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\PromoCode;
use App\Services\DeliveryRoutingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(
        protected DeliveryRoutingService $routingService
    ) {}

    /**
     * Generate an accurate road-distance delivery quote for the user's current cart and delivery coordinates.
     */
    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $cartItems = Cart::with('plant')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty.',
                'errors' => ['cart' => ['Add items to cart to calculate delivery.']],
            ], 400);
        }

        $subtotal = 0.0;
        foreach ($cartItems as $item) {
            if ($item->plant) {
                $subtotal += ($item->plant->price * $item->quantity);
            }
        }

        // Evaluate promo code if supplied
        $discountAmount = 0.0;
        $appliedPromo = null;
        $promoCodeInput = trim((string) ($validated['promo_code'] ?? ''));

        if ($promoCodeInput !== '') {
            $promo = PromoCode::where('code', strtoupper($promoCodeInput))->first();
            if ($promo) {
                $evaluation = $promo->evaluateEligibility($subtotal, $user);
                if ($evaluation['eligible']) {
                    $discountAmount = (float) $evaluation['discount'];
                    $appliedPromo = [
                        'id' => $promo->id,
                        'code' => $promo->code,
                        'description' => $promo->description,
                        'discount' => $discountAmount,
                    ];
                }
            }
        }

        $discountedSubtotal = max(0.0, round($subtotal - $discountAmount, 2));

        try {
            $quote = $this->routingService->quoteDelivery(
                (float) $validated['latitude'],
                (float) $validated['longitude'],
                $discountedSubtotal
            );

            $deliveryFee = (float) $quote['delivery_fee'];
            $tax = round($discountedSubtotal * 0.10, 2);
            $total = round($discountedSubtotal + $deliveryFee + $tax, 2);

            return response()->json([
                'message' => 'Delivery quote calculated successfully.',
                'data' => [
                    'subtotal' => round($subtotal, 2),
                    'discount_amount' => round($discountAmount, 2),
                    'discounted_subtotal' => $discountedSubtotal,
                    'delivery_fee' => $deliveryFee,
                    'tax' => $tax,
                    'total' => $total,
                    'promo' => $appliedPromo,
                    'road_distance_km' => $quote['road_distance_km'],
                    'is_free_delivery' => $quote['is_free_delivery'],
                    'qualification_reason' => $quote['qualification_reason'],
                    'quote_details' => $quote,
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['location' => [$e->getMessage()]],
            ], 422);
        }
    }
}
