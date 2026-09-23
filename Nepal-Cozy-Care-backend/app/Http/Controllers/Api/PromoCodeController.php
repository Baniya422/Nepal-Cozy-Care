<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromoCodeController extends Controller
{
    /**
     * Validate promo code at checkout.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();
        $code = strtoupper(trim($validated['code']));
        $promo = PromoCode::where('code', $code)->first();

        if (! $promo) {
            return response()->json([
                'message' => 'Invalid promo code.',
                'errors' => ['code' => ['The promo code entered does not exist.']],
            ], 404);
        }

        $subtotal = isset($validated['subtotal'])
            ? (float) $validated['subtotal']
            : null;

        if ($subtotal === null && $user) {
            $cartItems = Cart::with('plant')->where('user_id', $user->id)->get();
            $subtotal = (float) $cartItems->sum(function ($item) {
                return ($item->plant?->price ?? 0) * $item->quantity;
            });
        }

        $evaluation = $promo->evaluateEligibility($subtotal ?? 0.0, $user);

        if (! $evaluation['eligible']) {
            return response()->json([
                'message' => $evaluation['message'],
                'errors' => ['code' => [$evaluation['message']]],
            ], 422);
        }

        return response()->json([
            'message' => $evaluation['message'],
            'data' => [
                'promo' => [
                    'id' => $promo->id,
                    'code' => $promo->code,
                    'description' => $promo->description,
                    'type' => $promo->type,
                    'value' => $promo->value,
                    'discount' => $evaluation['discount'],
                    'discounted_subtotal' => $evaluation['discounted_subtotal'],
                ],
            ],
        ]);
    }

    /**
     * Admin: List all promo codes with stats.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = PromoCode::withCount('usages')->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $promos = $query->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'message' => null,
            'data' => [
                'promo_codes' => $promos->items(),
                'pagination' => [
                    'current_page' => $promos->currentPage(),
                    'per_page' => $promos->perPage(),
                    'total' => $promos->total(),
                    'last_page' => $promos->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Admin: Store a new promo code.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'total_usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['nullable', 'integer', 'min:1'],
            'is_first_order_only' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['is_first_order_only'] = $validated['is_first_order_only'] ?? false;
        $validated['per_customer_limit'] = $validated['per_customer_limit'] ?? 1;

        $promo = PromoCode::create($validated);

        return response()->json([
            'message' => 'Promo code created successfully.',
            'data' => ['promo_code' => $promo],
        ], 201);
    }

    /**
     * Admin: Update promo code.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $promo = PromoCode::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', 'unique:promo_codes,code,'.$promo->id],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'required', 'in:percentage,fixed'],
            'value' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'total_usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['nullable', 'integer', 'min:1'],
            'is_first_order_only' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper(trim($validated['code']));
        }

        $promo->update($validated);

        return response()->json([
            'message' => 'Promo code updated successfully.',
            'data' => ['promo_code' => $promo->fresh()],
        ]);
    }

    /**
     * Admin: Toggle active status.
     */
    public function toggle(int $id): JsonResponse
    {
        $promo = PromoCode::findOrFail($id);
        $promo->is_active = ! $promo->is_active;
        $promo->save();

        return response()->json([
            'message' => 'Promo code status toggled to '.($promo->is_active ? 'Active' : 'Inactive').'.',
            'data' => ['promo_code' => $promo],
        ]);
    }

    /**
     * Admin: Delete promo code.
     */
    public function destroy(int $id): JsonResponse
    {
        $promo = PromoCode::findOrFail($id);
        $promo->delete();

        return response()->json([
            'message' => 'Promo code deleted successfully.',
        ]);
    }
}
