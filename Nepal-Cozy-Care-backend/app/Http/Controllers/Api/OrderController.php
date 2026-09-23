<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\UpdateOrderConfirmationRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\AdminSetting;
use App\Models\Cart;
use App\Models\FinancialAuditLog;
use App\Models\GardenEntry;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plant;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\Shop;
use App\Services\DeliveryRoutingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(
        protected DeliveryRoutingService $deliveryRoutingService
    ) {}

    public function checkout(CheckoutRequest $request)
    {
        $settings = AdminSetting::current();
        if (! $settings->esewa_enabled && $request->payment_method !== 'cod') {
            return response()->json([
                'message' => 'Selected payment gateway is coming soon. Please use Cash on Delivery for now.',
                'errors' => [
                    'payment_method' => ['This payment method is not available yet.'],
                ],
            ], 422);
        }

        $userId = $request->user()->id;
        $cartItems = Cart::with(['plant.shop', 'plant.supplier'])
            ->where('user_id', $userId)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty',
                'errors' => [
                    'cart' => ['Cart is empty'],
                ],
            ], 400);
        }

        $result = DB::transaction(function () use ($cartItems, $request, $userId, $settings) {
            $subtotal = 0.0;
            foreach ($cartItems as $item) {
                $plant = $item->plant;
                if (! $plant) {
                    return response()->json(['message' => 'A product in your cart no longer exists'], 404);
                }
                if ($plant->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Not enough stock for {$plant->name}",
                        'available_stock' => $plant->stock,
                    ], 400);
                }
                $subtotal += ($plant->price * $item->quantity);
            }

            // Promo code evaluation with pessimistic locking
            $promo = null;
            $discountAmount = 0.0;
            if ($request->filled('promo_code')) {
                $code = strtoupper(trim($request->promo_code));
                $promo = PromoCode::where('code', $code)->lockForUpdate()->first();

                if (! $promo) {
                    return response()->json([
                        'message' => 'The promo code entered does not exist.',
                        'errors' => ['promo_code' => ['Invalid promo code.']],
                    ], 422);
                }

                $eval = $promo->evaluateEligibility($subtotal, $request->user());
                if (! $eval['eligible']) {
                    return response()->json([
                        'message' => $eval['message'],
                        'errors' => ['promo_code' => [$eval['message']]],
                    ], 422);
                }

                $discountAmount = (float) $eval['discount'];
            }

            $discountedSubtotal = max(0.0, round($subtotal - $discountAmount, 2));

            // Road distance and delivery fee calculation
            $roadDistanceKm = null;
            $quoteDetails = null;
            $deliveryFee = 0.0;

            if ($request->filled('delivery_latitude') && $request->filled('delivery_longitude')) {
                try {
                    $quote = $this->deliveryRoutingService->quoteDelivery(
                        (float) $request->delivery_latitude,
                        (float) $request->delivery_longitude,
                        $discountedSubtotal,
                        $settings
                    );
                    $deliveryFee = (float) $quote['delivery_fee'];
                    $roadDistanceKm = (float) $quote['road_distance_km'];
                    $quoteDetails = $quote;
                } catch (\RuntimeException $e) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'errors' => ['location' => [$e->getMessage()]],
                    ], 422);
                }
            } else {
                // Fallback when coordinates are not supplied
                $deliveryFee = 0.0;
            }

            $tax = round($discountedSubtotal * 0.10, 2);
            $total = round($discountedSubtotal + $deliveryFee + $tax, 2);

            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'payment_method' => $request->payment_method,
                'promo_code_id' => $promo?->id,
                'promo_code' => $promo?->code,
                'discount_amount' => $discountAmount,
                'subtotal' => round($subtotal, 2),
                'delivery_fee' => $deliveryFee,
                'tax' => $tax,
                'total' => $total,
                'shipping_name' => $request->shipping_name,
                'shipping_phone' => $request->shipping_phone,
                'shipping_city' => $request->shipping_city,
                'shipping_address' => $request->shipping_address,
                'delivery_latitude' => $request->delivery_latitude,
                'delivery_longitude' => $request->delivery_longitude,
                'delivery_road_distance_km' => $roadDistanceKm,
                'delivery_quote_details' => $quoteDetails,
                'location_notes' => $request->location_notes,
                'preferred_contact_method' => $request->preferred_contact_method,
                'confirmation_status' => 'pending',
                'estimated_delivery_date' => now()->addDays(4),
            ]);

            // Record promo code usage
            if ($promo) {
                PromoCodeUsage::create([
                    'promo_code_id' => $promo->id,
                    'user_id' => $userId,
                    'order_id' => $order->id,
                    'discount_amount' => $discountAmount,
                ]);
                $promo->increment('times_used');
            }

            $defaultShop = null;
            $hasIncompleteCost = false;

            foreach ($cartItems as $item) {
                $plant = $item->plant;
                $price = $plant->price;
                $lineTotal = $price * $item->quantity;

                $shop = $plant->shop;
                if (! $shop && ! $plant->shop_id && ! $defaultShop) {
                    $defaultShop = Shop::where('slug', 'nepal-cozy-care')->first();
                }
                $shopId = $plant->shop_id ?? $defaultShop?->id;
                $shopName = $shop?->name ?? $defaultShop?->name ?? 'Nepal Cozy Care';

                // Supplier snapshots
                $supplier = $plant->supplier;
                $supplierId = $plant->supplier_id;
                $supplierName = $supplier?->name;
                $wholesaleUnitCost = $plant->wholesale_price;

                if ($wholesaleUnitCost === null) {
                    $hasIncompleteCost = true;
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'plant_id' => $plant->id,
                    'shop_id' => $shopId,
                    'supplier_id' => $supplierId,
                    'product_name' => $plant->name,
                    'shop_name' => $shopName,
                    'supplier_name' => $supplierName,
                    'wholesale_unit_cost' => $wholesaleUnitCost,
                    'supplier_obligation_status' => 'payable',
                    'supplier_payout_status' => 'unpaid',
                    'quantity' => $item->quantity,
                    'price' => $price,
                    'line_total' => $lineTotal,
                ]);

                $plant->stock = $plant->stock - $item->quantity;
                $plant->save();

                if (! $plant->isAccessory()) {
                    GardenEntry::create([
                        'user_id' => $userId,
                        'plant_id' => $plant->id,
                        'source_order_id' => $order->id,
                        'nickname' => $plant->name,
                        'notes' => 'Added automatically after checkout.',
                        'quantity' => $item->quantity,
                        'watering_frequency_days' => $this->guessWateringFrequency($plant),
                        'fertilizing_frequency_days' => 30,
                        'acquired_at' => now()->toDateString(),
                    ]);
                }
            }

            if ($hasIncompleteCost) {
                $order->update(['earnings_incomplete' => true]);
            }

            Cart::where('user_id', $userId)->delete();

            return $order->load(['items.plant', 'items.shop', 'user']);
        });

        if ($result instanceof JsonResponse) {
            return $result;
        }

        OrderCreated::dispatch($result);

        return response()->json([
            'message' => 'Order placed successfully',
            'data' => [
                'order' => $result,
            ],
        ], 201);
    }


    public function adminIndex(Request $request)
    {
        $query = Order::with(['items.plant', 'items.shop', 'user'])
            ->latest();

        if ($shopId = $request->query('shop_id')) {
            $query->whereHas('items', function ($q) use ($shopId) {
                $q->where('shop_id', $shopId);
            });
        }

        $perPage = (int) $request->query('per_page', 20);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'orders' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::with(['items.plant', 'items.shop'])->findOrFail($id);
        $user = $request->user();
        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending orders can be cancelled',
                'errors' => [],
            ], 400);
        }
        if (! $user->isSuperAdmin() && $order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Forbidden',
                'errors' => [],
            ], 403);
        }
        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                if ($item->plant) {
                    $item->plant->increment('stock', $item->quantity);
                }
            }

            // Restore promo code usage if order had promo applied
            if ($order->promo_code_id) {
                $promo = PromoCode::find($order->promo_code_id);
                if ($promo && $promo->times_used > 0) {
                    $promo->decrement('times_used');
                }
                PromoCodeUsage::where('order_id', $order->id)->delete();
            }

            $order->status = 'cancelled';
            $order->save();

            FinancialAuditLog::log(
                'order_cancelled',
                'order',
                $order->id,
                ['status' => 'pending'],
                ['status' => 'cancelled'],
                "Order #{$order->id} was cancelled. Stock restored and promo reservation released. Supplier obligations remain recorded."
            );
        });

        return response()->json([
            'message' => 'Order cancelled successfully',
            'data' => [
                'order' => $order->fresh(['items.plant', 'items.shop']),
            ],
        ]);
    }

    public function myOrders(Request $request)
    {
        $query = Order::with(['items.plant', 'items.shop'])
            ->where('user_id', $request->user()->id)
            ->latest();
        $perPage = (int) $request->query('per_page', 10);
        $paginator = $query->paginate($perPage);

        // Hide private wholesale data from customer response
        $paginator->getCollection()->each(function ($order) {
            $order->items->makeHidden(['wholesale_unit_cost', 'supplier_id', 'supplier_name', 'supplier_obligation_status', 'supplier_payout_status']);
        });

        return response()->json([
            'message' => null,
            'data' => [
                'orders' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['items.plant', 'items.shop', 'items.supplier', 'user', 'expenses'])->findOrFail($id);
        $user = $request->user();
        $isAdmin = $user->isSuperAdmin() || in_array($user->role, ['admin', 'super_admin'], true);

        if ($order->user_id !== $user->id && ! $isAdmin) {
            return response()->json([
                'message' => 'Forbidden',
                'errors' => [],
            ], 403);
        }

        if (! $isAdmin) {
            $order->items->makeHidden(['wholesale_unit_cost', 'supplier_id', 'supplier_name', 'supplier_obligation_status', 'supplier_payout_status']);
            $order->makeHidden(['expenses']);
        }

        return response()->json([
            'message' => null,
            'data' => [
                'order' => $order,
            ],
        ]);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'payment_status' => ['required', 'in:unpaid,paid,partially_paid,refunded'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $order->payment_status;
        $order->payment_status = $validated['payment_status'];
        $order->save();

        FinancialAuditLog::log(
            'payment_status_updated',
            'order',
            $order->id,
            ['payment_status' => $oldStatus],
            ['payment_status' => $order->payment_status],
            $validated['notes'] ?? "Payment status changed from {$oldStatus} to {$order->payment_status}"
        );

        return response()->json([
            'message' => 'Order payment status updated successfully.',
            'data' => [
                'order' => $order->fresh(['items.plant', 'user']),
            ],
        ]);
    }


    public function updateStatus(UpdateOrderStatusRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $status = $request->status === 'processing' ? 'packed' : $request->status;
        $currentStatus = $order->status === 'processing' ? 'packed' : $order->status;
        if (in_array($currentStatus, ['delivered', 'cancelled'])) {
            return response()->json([
                'message' => 'Delivered or cancelled orders cannot be updated',
                'errors' => [],
            ], 422);
        }
        $allowedTransitions = [
            'pending' => ['packed', 'cancelled'],
            'packed' => ['shipped', 'cancelled'],
            'shipped' => ['out_for_delivery'],
            'out_for_delivery' => ['delivered'],
        ];
        if ($status !== $currentStatus && ! in_array($status, $allowedTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => 'Invalid order status transition',
                'errors' => [
                    'status' => ['This order cannot move to the requested status.'],
                ],
            ], 422);
        }
        $order->status = $status;
        switch ($status) {
            case 'packed':
                $order->packed_at = now();
                break;
            case 'shipped':
                $order->shipped_at = now();
                if ($request->has('tracking_number')) {
                    $order->tracking_number = $request->tracking_number;
                }
                if ($request->has('courier_name')) {
                    $order->courier_name = $request->courier_name;
                }
                break;
            case 'out_for_delivery':
                $order->out_for_delivery_at = now();
                break;
            case 'delivered':
                $order->delivered_at = now();
                break;
        }
        $order->save();

        return response()->json([
            'message' => 'Order status updated',
            'data' => [
                'order' => $order->fresh(['items.plant', 'user']),
            ],
        ]);
    }

    public function updateConfirmation(UpdateOrderConfirmationRequest $request, $id)
    {
        $order = Order::with(['items.plant', 'user'])->findOrFail($id);
        if ($request->has('confirmation_status')) {
            $order->confirmation_status = $request->confirmation_status ?? 'pending';
            if (in_array($order->confirmation_status, ['contacted', 'location_confirmed']) && ! $order->contacted_at) {
                $order->contacted_at = now();
            }
            if ($order->confirmation_status === 'location_confirmed' && ! $order->location_confirmed_at) {
                $order->location_confirmed_at = now();
            }
        }
        if ($request->has('confirmation_notes')) {
            $order->confirmation_notes = $request->filled('confirmation_notes')
                ? trim((string) $request->confirmation_notes)
                : null;
        }
        $order->save();

        return response()->json([
            'message' => 'Order confirmation updated',
            'data' => [
                'order' => $order->fresh(['items.plant', 'user']),
            ],
        ]);
    }

    public function track(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'email' => 'required|email',
        ]);
        $order = Order::with(['items.plant', 'items.shop', 'user'])
            ->where('id', $validated['order_id'])
            ->first();
        if (! $order) {
            return response()->json([
                'message' => 'Order not found',
                'errors' => [
                    'order_id' => ['Order not found with the provided details'],
                ],
            ], 404);
        }
        if ($order->user->email !== $validated['email']) {
            return response()->json([
                'message' => 'Invalid credentials',
                'errors' => [
                    'email' => ['Email does not match the order'],
                ],
            ], 403);
        }
        $timeline = $this->buildTimeline($order);

        return response()->json([
            'message' => null,
            'data' => [
                'order' => $order,
                'timeline' => $timeline,
                'current_status' => $order->status,
            ],
        ]);
    }

    /**
     * Build order tracking timeline
     */
    private function buildTimeline(Order $order): array
    {
        $timeline = [
            [
                'status' => 'placed',
                'label' => 'Order Placed',
                'completed' => true,
                'date' => $order->created_at,
                'description' => 'Your order has been received',
            ],
            [
                'status' => 'packed',
                'label' => 'Packed',
                'completed' => in_array($order->status, ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']),
                'date' => $order->packed_at,
                'description' => 'Your order has been packed and is ready for shipment',
            ],
            [
                'status' => 'shipped',
                'label' => 'Shipped',
                'completed' => in_array($order->status, ['shipped', 'out_for_delivery', 'delivered']),
                'date' => $order->shipped_at,
                'description' => $order->courier_name
                    ? "Shipped via {$order->courier_name}"
                    : 'Your order is on the way',
            ],
            [
                'status' => 'out_for_delivery',
                'label' => 'Out for Delivery',
                'completed' => in_array($order->status, ['out_for_delivery', 'delivered']),
                'date' => $order->out_for_delivery_at,
                'description' => 'Your order is out for delivery today',
            ],
            [
                'status' => 'delivered',
                'label' => 'Delivered',
                'completed' => $order->status === 'delivered',
                'date' => $order->delivered_at,
                'description' => 'Your order has been delivered',
            ],
        ];

        return $timeline;
    }

    private function guessWateringFrequency(Plant $plant): int
    {
        $value = strtolower((string) $plant->water);
        if (str_contains($value, 'daily')) {
            return 2;
        }
        if (str_contains($value, 'bi') || str_contains($value, 'every two')) {
            return 14;
        }
        if (str_contains($value, 'low') || str_contains($value, 'weekly')) {
            return 7;
        }

        return 6;
    }
}
