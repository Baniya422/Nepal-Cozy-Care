<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\UpdateOrderConfirmationRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Cart;
use App\Models\GardenEntry;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // ✅ Checkout: cart -> order
    public function checkout(CheckoutRequest $request)
    {
        $userId = $request->user()->id;

        $cartItems = Cart::with('plant')
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

        return DB::transaction(function () use ($cartItems, $request, $userId) {

            // 1) Stock validation + subtotal
            $subtotal = 0;

            foreach ($cartItems as $item) {
                $plant = $item->plant;

                if (!$plant) {
                    return response()->json(['message' => 'A product in your cart no longer exists'], 404);
                }

                if ($plant->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Not enough stock for {$plant->name}",
                        'available_stock' => $plant->stock
                    ], 400);
                }

                $subtotal += ($plant->price * $item->quantity);
            }

            // 2) Fees (you can adjust later)
            $deliveryFee = 0;
            $tax = round($subtotal * 0.10, 2);
            $total = $subtotal + $deliveryFee + $tax;

            // 3) Create order
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'tax' => $tax,
                'total' => $total,
                'shipping_name' => $request->shipping_name,
                'shipping_phone' => $request->shipping_phone,
                'shipping_city' => $request->shipping_city,
                'shipping_address' => $request->shipping_address,
                'location_notes' => $request->location_notes,
                'preferred_contact_method' => $request->preferred_contact_method,
                'confirmation_status' => 'pending',
                'estimated_delivery_date' => now()->addDays(4),
            ]);

            // 4) Create items + reduce stock
            foreach ($cartItems as $item) {
                $plant = $item->plant;

                $price = $plant->price; // snapshot
                $lineTotal = $price * $item->quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'plant_id' => $plant->id,
                    'quantity' => $item->quantity,
                    'price' => $price,
                    'line_total' => $lineTotal,
                ]);

                // reduce stock
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

            // 5) Clear cart
            Cart::where('user_id', $userId)->delete();

            // 6) Dispatch OrderCreated event to increment plant sales
            OrderCreated::dispatch($order->load('items.plant'));

            return response()->json([
                'message' => 'Order placed successfully',
                'data' => [
                    'order' => $order->load('items.plant'),
                ],
            ], 201);
        });
    }

    // ✅ Admin: list all orders with pagination
    public function adminIndex(Request $request)
    {
        $query = Order::with(['items.plant', 'user'])
            ->latest();

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

    // ✅ Cancel order (user or admin, only when pending)
    public function cancel(Request $request, $id)
    {
        $order = Order::with('items.plant')->findOrFail($id);

        $user = $request->user();

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending orders can be cancelled',
                'errors' => [],
            ], 400);
        }

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
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

            $order->status = 'cancelled';
            $order->save();
        });

        return response()->json([
            'message' => 'Order cancelled successfully',
            'data' => [
                'order' => $order->fresh('items.plant'),
            ],
        ]);
    }

    // ✅ My Orders
    public function myOrders(Request $request)
    {
        $query = Order::with('items.plant')
            ->where('user_id', $request->user()->id)
            ->latest();

        $perPage = (int) $request->query('per_page', 10);
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

    // ✅ Order Detail (only owner)
    public function show(Request $request, $id)
    {
        $order = Order::with('items.plant')->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Forbidden',
                'errors' => [],
            ], 403);
        }

        return response()->json([
            'message' => null,
            'data' => [
                'order' => $order,
            ],
        ]);
    }

    // ✅ Admin: Update status
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

        if ($status !== $currentStatus && !in_array($status, $allowedTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => 'Invalid order status transition',
                'errors' => [
                    'status' => ['This order cannot move to the requested status.'],
                ],
            ], 422);
        }

        $order->status = $status;
        
        // Update tracking timestamps based on status
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

    // ✅ Track Order (Public - no authentication required)
    public function track(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'email' => 'required|email',
        ]);

        // Find order by ID and verify email matches the user's email
        $order = Order::with(['items.plant', 'user'])
            ->where('id', $validated['order_id'])
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'Order not found',
                'errors' => [
                    'order_id' => ['Order not found with the provided details'],
                ],
            ], 404);
        }

        // Verify email matches the order's user email
        if ($order->user->email !== $validated['email']) {
            return response()->json([
                'message' => 'Invalid credentials',
                'errors' => [
                    'email' => ['Email does not match the order'],
                ],
            ], 403);
        }

        // Build timeline
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
