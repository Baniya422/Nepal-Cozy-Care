<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Plant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboardStats(Request $request)
    {
        $totalPlants = Plant::count();
        $totalOrders = Order::count();
        $totalUsers = User::count();
        $totalSales = Order::where('status', '!=', 'cancelled')->sum('total');

        $lastMonth = now()->subMonth();

        $plantsLastMonth = Plant::where('created_at', '<', $lastMonth)->count();
        $ordersLastMonth = Order::where('created_at', '<', $lastMonth)->count();
        $usersLastMonth = User::where('created_at', '<', $lastMonth)->count();
        $salesLastMonth = Order::where('created_at', '<', $lastMonth)
            ->where('status', '!=', 'cancelled')
            ->sum('total');

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
                    'status' => $this->normalizeOrderStatus($order->status),
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
            ->where('orders.status', '!=', 'cancelled')
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

    /**
     * Real-time reports payload
     */
    public function reports(Request $request)
    {
        [$start, $end, $previousStart, $previousEnd] = $this->resolveDateRange(
            $request->query('range', 'last30days')
        );

        $salesQuery = Order::whereBetween('created_at', [$start, $end])
            ->where('status', '!=', 'cancelled');
        $previousSalesQuery = Order::whereBetween('created_at', [$previousStart, $previousEnd])
            ->where('status', '!=', 'cancelled');

        $totalSales = (float) $salesQuery->sum('total');
        $previousSales = (float) $previousSalesQuery->sum('total');
        $ordersCount = (int) $salesQuery->count();
        $averageOrderValue = $ordersCount > 0 ? round($totalSales / $ordersCount, 2) : 0;
        $salesChange = $previousSales > 0
            ? round((($totalSales - $previousSales) / $previousSales) * 100, 1)
            : 0;

        $topSelling = DB::table('order_items')
            ->join('plants', 'order_items.plant_id', '=', 'plants.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                'plants.id',
                'plants.name',
                DB::raw('SUM(order_items.quantity) as sales'),
                DB::raw('SUM(order_items.line_total) as revenue')
            )
            ->groupBy('plants.id', 'plants.name')
            ->orderByDesc('sales')
            ->take(5)
            ->get();

        $lowStock = Plant::where('stock', '<=', 10)
            ->orderBy('stock')
            ->take(5)
            ->get(['id', 'name', 'stock']);

        $statusCounts = Order::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->reduce(function ($carry, $item) {
                $normalizedStatus = $this->normalizeOrderStatus($item->status);
                $carry[$normalizedStatus] = ($carry[$normalizedStatus] ?? 0) + (int) $item->total;
                return $carry;
            }, [
                'pending' => 0,
                'packed' => 0,
                'shipped' => 0,
                'out_for_delivery' => 0,
                'delivered' => 0,
                'cancelled' => 0,
            ]);

        $totalCustomers = User::where('role', 'customer')->count();
        $newCustomers = User::where('role', 'customer')
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $returningCustomers = User::where('role', 'customer')
            ->has('orders', '>', 1)
            ->count();
        $retention = $totalCustomers > 0
            ? round(($returningCustomers / $totalCustomers) * 100, 1)
            : 0;

        return response()->json([
            'message' => null,
            'data' => [
                'range' => [
                    'start' => $start,
                    'end' => $end,
                ],
                'sales' => [
                    'total' => $totalSales,
                    'change' => $salesChange,
                    'orders' => $ordersCount,
                    'avg_order_value' => $averageOrderValue,
                ],
                'products' => [
                    'top_selling' => $topSelling,
                    'low_stock' => $lowStock,
                ],
                'customers' => [
                    'new' => $newCustomers,
                    'returning' => $returningCustomers,
                    'total' => $totalCustomers,
                    'retention' => $retention,
                ],
                'orders_by_status' => $statusCounts,
            ],
        ]);
    }

    /**
     * Real users listing for admin page
     */
    public function users(Request $request)
    {
        $users = User::withCount(['orders', 'tokens'])
            ->withSum('orders as total_spent', 'total')
            ->latest()
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'join_date' => $user->created_at,
                    'orders_count' => $user->orders_count,
                    'total_spent' => (float) ($user->total_spent ?? 0),
                    'status' => $user->tokens_count > 0 ? 'active' : 'inactive',
                ];
            });

        $totalUsers = $users->count();
        $activeUsers = $users->where('status', 'active')->count();

        return response()->json([
            'message' => null,
            'data' => [
                'users' => $users->values(),
                'stats' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'avg_orders' => round((float) $users->avg('orders_count'), 1),
                    'new_this_month' => User::whereBetween('created_at', [
                        now()->startOfMonth(),
                        now()->endOfMonth(),
                    ])->count(),
                ],
            ],
        ]);
    }

    private function normalizeOrderStatus(?string $status): string
    {
        return $status === 'processing' ? 'packed' : ($status ?? 'pending');
    }

    private function resolveDateRange(string $range): array
    {
        $end = now();

        switch ($range) {
            case 'today':
                $start = now()->startOfDay();
                break;
            case 'last7days':
                $start = now()->copy()->subDays(6)->startOfDay();
                break;
            case 'last90days':
                $start = now()->copy()->subDays(89)->startOfDay();
                break;
            case 'thisYear':
                $start = now()->startOfYear();
                break;
            case 'last30days':
            default:
                $start = now()->copy()->subDays(29)->startOfDay();
                break;
        }

        $durationInSeconds = max(1, $start->diffInSeconds($end));
        $previousEnd = $start->copy()->subSecond();
        $previousStart = $previousEnd->copy()->subSeconds($durationInSeconds);

        return [$start, $end, $previousStart, $previousEnd];
    }
}
