<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Plant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboardStats(Request $request)
    {
        // Total counts
        $totalPlants = Plant::count();
        $totalOrders = Order::count();
        $totalUsers = User::count();
        $totalSales = Order::whereIn('status', ['completed', 'delivered'])
            ->sum('total');

        // Calculate percentage changes (compare with last month)
        $lastMonth = now()->subMonth();
        
        $plantsLastMonth = Plant::where('created_at', '<', $lastMonth)->count();
        $ordersLastMonth = Order::where('created_at', '<', $lastMonth)->count();
        $usersLastMonth = User::where('created_at', '<', $lastMonth)->count();
        $salesLastMonth = Order::where('created_at', '<', $lastMonth)
            ->whereIn('status', ['completed', 'delivered'])
            ->sum('total');

        // Calculate percentage changes
        $plantsChange = $plantsLastMonth > 0 
            ? round((($totalPlants - $plantsLastMonth) / $plantsLastMonth) * 100, 1)
            : 0;
        
        $ordersChange = $ordersLastMonth > 0 
            ? round((($totalOrders - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : 0;
        
        $usersChange = $usersLastMonth > 0 
            ? round((($totalUsers - $usersLastMonth) / $usersLastMonth) * 100, 1)
            : 0;
        
        $salesChange = $salesLastMonth > 0 
            ? round((($totalSales - $salesLastMonth) / $salesLastMonth) * 100, 1)
            : 0;

        return response()->json([
            'message' => null,
            'data' => [
                'total_plants' => $totalPlants,
                'total_orders' => $totalOrders,
                'total_users' => $totalUsers,
                'total_sales' => $totalSales,
                'changes' => [
                    'plants' => $plantsChange,
                    'orders' => $ordersChange,
                    'users' => $usersChange,
                    'sales' => $salesChange,
                ],
            ],
        ]);
    }

    /**
     * Get recent orders for dashboard
     */
    public function recentOrders(Request $request)
    {
        $orders = Order::with(['user'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_id' => '#ORD-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                    'customer' => $order->user ? $order->user->name : 'Unknown',
                    'amount' => $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                ];
            });

        return response()->json([
            'message' => null,
            'data' => $orders,
        ]);
    }

    /**
     * Get top selling products
     */
    public function topProducts(Request $request)
    {
        $topProducts = DB::table('order_items')
            ->join('plants', 'order_items.plant_id', '=', 'plants.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.status', ['completed', 'delivered'])
            ->select(
                'plants.id',
                'plants.name',
                DB::raw('SUM(order_items.quantity) as total_sales'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->groupBy('plants.id', 'plants.name')
            ->orderByDesc('total_sales')
            ->take(5)
            ->get();

        return response()->json([
            'message' => null,
            'data' => $topProducts,
        ]);
    }
}
