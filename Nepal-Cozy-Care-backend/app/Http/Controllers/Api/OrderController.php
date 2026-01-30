<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Cart;
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
            $deliveryFee = 0; // set later if needed
            $tax = 0;         // set later if needed
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
                'shipping_address' => $request->shipping_address,
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
            }

            // 5) Clear cart
            Cart::where('user_id', $userId)->delete();

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
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'message' => 'Order status updated',
            'data' => [
                'order' => $order,
            ],
        ]);
    }
}
