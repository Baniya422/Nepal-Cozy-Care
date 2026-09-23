<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialAuditLog;
use App\Models\Order;
use App\Models\OrderExpense;
use App\Models\OrderItem;
use App\Models\Plant;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\SupplierPaymentAllocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    /**
     * Admin: List all nursery suppliers with financial summaries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query()->withCount(['plants', 'orderItems', 'payments']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('contact_person', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('address', 'like', '%'.$search.'%');
            });
        }

        $suppliers = $query->orderBy('name')->get()->map(function ($supplier) {
            $summary = $supplier->financialSummary();

            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'contact_person' => $supplier->contact_person,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'address' => $supplier->address,
                'notes' => $supplier->notes,
                'is_active' => $supplier->is_active,
                'plants_count' => $supplier->plants_count,
                'order_items_count' => $supplier->order_items_count,
                'payments_count' => $supplier->payments_count,
                'financials' => $summary,
                'created_at' => $supplier->created_at,
            ];
        });

        return response()->json([
            'message' => null,
            'data' => [
                'suppliers' => $suppliers,
            ],
        ]);
    }

    /**
     * Admin: Store new nursery supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $supplier = Supplier::create($validated);

        FinancialAuditLog::log(
            'supplier_created',
            'supplier',
            $supplier->id,
            null,
            $supplier->toArray(),
            "Created supplier: {$supplier->name}"
        );

        return response()->json([
            'message' => 'Nursery supplier added successfully.',
            'data' => ['supplier' => $supplier],
        ], 201);
    }

    /**
     * Admin: Show specific nursery supplier details with products, orders, and payments.
     */
    public function show(int $id): JsonResponse
    {
        $supplier = Supplier::with([
            'plants:id,supplier_id,name,category,price,wholesale_price,stock,image',
            'payments.creator:id,name',
            'payments.allocations.order:id,status,created_at',
        ])->findOrFail($id);

        $orderItems = OrderItem::with(['order:id,status,payment_status,created_at,shipping_name', 'plant:id,name'])
            ->where('supplier_id', $supplier->id)
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'supplier' => $supplier,
                'financials' => $supplier->financialSummary(),
                'order_items' => $orderItems,
            ],
        ]);
    }

    /**
     * Admin: Update nursery supplier.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $oldValues = $supplier->toArray();
        $supplier->update($validated);

        FinancialAuditLog::log(
            'supplier_updated',
            'supplier',
            $supplier->id,
            $oldValues,
            $supplier->fresh()->toArray(),
            "Updated supplier: {$supplier->name}"
        );

        return response()->json([
            'message' => 'Supplier details updated successfully.',
            'data' => ['supplier' => $supplier->fresh()],
        ]);
    }

    /**
     * Admin: Associate product with a supplier and set default wholesale unit cost.
     */
    public function assignPlantSupplier(Request $request, int $plantId): JsonResponse
    {
        $plant = Plant::findOrFail($plantId);

        $validated = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'wholesale_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $oldValues = [
            'supplier_id' => $plant->supplier_id,
            'wholesale_price' => $plant->wholesale_price,
        ];

        $plant->update($validated);

        FinancialAuditLog::log(
            'plant_supplier_assigned',
            'plant',
            $plant->id,
            $oldValues,
            $validated,
            "Assigned supplier ID {$request->supplier_id} with wholesale cost {$request->wholesale_price} to plant {$plant->name}"
        );

        return response()->json([
            'message' => 'Product supplier details updated.',
            'data' => ['plant' => $plant->fresh(['supplier'])],
        ]);
    }

    /**
     * Admin: Record payment made to nursery supplier and optionally allocate to orders.
     */
    public function recordPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:bank_transfer,cash,cheque,esewa_manual,other'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'allocations' => ['nullable', 'array'],
            'allocations.*.order_id' => ['nullable', 'exists:orders,id'],
            'allocations.*.order_item_id' => ['nullable', 'exists:order_items,id'],
            'allocations.*.amount' => ['required_with:allocations', 'numeric', 'min:0.01'],
            'allocations.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        $payment = DB::transaction(function () use ($validated, $request) {
            $payment = SupplierPayment::create([
                'supplier_id' => $validated['supplier_id'],
                'amount' => (float) $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            if (! empty($validated['allocations'])) {
                foreach ($validated['allocations'] as $alloc) {
                    SupplierPaymentAllocation::create([
                        'supplier_payment_id' => $payment->id,
                        'order_id' => $alloc['order_id'] ?? null,
                        'order_item_id' => $alloc['order_item_id'] ?? null,
                        'amount' => (float) $alloc['amount'],
                        'notes' => $alloc['notes'] ?? null,
                    ]);

                    if (! empty($alloc['order_item_id'])) {
                        $item = OrderItem::find($alloc['order_item_id']);
                        if ($item) {
                            $totalAllocated = (float) SupplierPaymentAllocation::where('order_item_id', $item->id)->sum('amount');
                            $itemCost = ($item->wholesale_unit_cost ?? 0) * $item->quantity;
                            if ($totalAllocated >= $itemCost && $itemCost > 0) {
                                $item->update(['supplier_payout_status' => 'settled']);
                            } elseif ($totalAllocated > 0) {
                                $item->update(['supplier_payout_status' => 'partially_paid']);
                            }
                        }
                    }
                }
            }

            FinancialAuditLog::log(
                'supplier_payment_recorded',
                'supplier_payment',
                $payment->id,
                null,
                $payment->toArray(),
                "Recorded NPR {$payment->amount} payment to supplier ID {$payment->supplier_id}"
            );

            return $payment;
        });

        return response()->json([
            'message' => 'Supplier payment recorded successfully.',
            'data' => [
                'payment' => $payment->load(['allocations', 'creator:id,name']),
            ],
        ], 201);
    }

    /**
     * Admin: Delete payment record.
     */
    public function deletePayment(int $paymentId): JsonResponse
    {
        $payment = SupplierPayment::findOrFail($paymentId);

        DB::transaction(function () use ($payment) {
            $oldValues = $payment->toArray();
            $payment->delete();

            FinancialAuditLog::log(
                'supplier_payment_deleted',
                'supplier_payment',
                $payment->id,
                $oldValues,
                null,
                "Deleted supplier payment of NPR {$payment->amount}"
            );
        });

        return response()->json([
            'message' => 'Supplier payment deleted successfully.',
        ]);
    }

    /**
     * Admin: Assign or update supplier and wholesale cost snapshot on an order item.
     */
    public function assignOrderItemSupplier(Request $request, int $orderId, int $itemId): JsonResponse
    {
        $item = OrderItem::where('order_id', $orderId)->findOrFail($itemId);

        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'wholesale_unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $supplier = Supplier::findOrFail($validated['supplier_id']);
        $oldValues = [
            'supplier_id' => $item->supplier_id,
            'supplier_name' => $item->supplier_name,
            'wholesale_unit_cost' => $item->wholesale_unit_cost,
        ];

        $item->update([
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'wholesale_unit_cost' => (float) $validated['wholesale_unit_cost'],
        ]);

        // Re-evaluate earnings_incomplete flag on parent order
        $order = Order::with('items')->find($orderId);
        if ($order) {
            $hasIncomplete = $order->items->contains(fn ($it) => $it->wholesale_unit_cost === null);
            $order->update(['earnings_incomplete' => $hasIncomplete]);
        }

        FinancialAuditLog::log(
            'order_item_supplier_assigned',
            'order_item',
            $item->id,
            $oldValues,
            $item->toArray(),
            "Assigned supplier {$supplier->name} with unit cost NPR {$validated['wholesale_unit_cost']} to order item {$item->id}"
        );

        return response()->json([
            'message' => 'Order item supplier snapshot saved.',
            'data' => ['order_item' => $item->fresh()],
        ]);
    }

    /**
     * Admin: Adjust supplier obligation status on cancellation/return.
     * Handled explicitly: does not automatically erase obligation just because customer cancelled.
     */
    public function updateObligationStatus(Request $request, int $orderId, int $itemId): JsonResponse
    {
        $item = OrderItem::where('order_id', $orderId)->findOrFail($itemId);

        $validated = $request->validate([
            'supplier_obligation_status' => ['required', 'in:payable,waived,adjusted'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $item->supplier_obligation_status;
        $item->update([
            'supplier_obligation_status' => $validated['supplier_obligation_status'],
        ]);

        FinancialAuditLog::log(
            'supplier_obligation_adjusted',
            'order_item',
            $item->id,
            ['supplier_obligation_status' => $oldStatus],
            ['supplier_obligation_status' => $validated['supplier_obligation_status']],
            "Obligation adjusted from {$oldStatus} to {$validated['supplier_obligation_status']}. Notes: ".($validated['notes'] ?? 'None')
        );

        return response()->json([
            'message' => "Supplier obligation updated to '{$validated['supplier_obligation_status']}'.",
            'data' => ['order_item' => $item],
        ]);
    }

    /**
     * Admin: Record customer COD collection separately from supplier settlement.
     */
    public function recordCodCollection(Request $request, int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        $validated = $request->validate([
            'cod_collected_amount' => ['required', 'numeric', 'min:0'],
            'payment_status' => ['required', 'in:paid,unpaid,partially_paid,refunded'],
            'notes' => ['nullable', 'string'],
        ]);

        $oldValues = [
            'cod_collected_amount' => $order->cod_collected_amount,
            'payment_status' => $order->payment_status,
        ];

        $order->update([
            'cod_collected_amount' => (float) $validated['cod_collected_amount'],
            'cod_collected_at' => now(),
            'cod_collected_by' => $request->user()->id,
            'payment_status' => $validated['payment_status'],
        ]);

        FinancialAuditLog::log(
            'cod_collected',
            'order',
            $order->id,
            $oldValues,
            [
                'cod_collected_amount' => $order->cod_collected_amount,
                'payment_status' => $order->payment_status,
            ],
            "Customer COD collected NPR {$order->cod_collected_amount}. Status: {$order->payment_status}"
        );

        return response()->json([
            'message' => 'Customer COD payment recorded successfully.',
            'data' => ['order' => $order->fresh()],
        ]);
    }

    /**
     * Admin: Order expenses (delivery, packaging, transport).
     */
    public function recordOrderExpense(Request $request, int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        $validated = $request->validate([
            'category' => ['required', 'in:delivery,packaging,transport,handling,other'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $expense = OrderExpense::create([
            'order_id' => $order->id,
            'category' => $validated['category'],
            'amount' => (float) $validated['amount'],
            'description' => $validated['description'] ?? null,
            'recorded_at' => now(),
            'recorded_by' => $request->user()->id,
        ]);

        FinancialAuditLog::log(
            'order_expense_recorded',
            'order_expense',
            $expense->id,
            null,
            $expense->toArray(),
            "Added {$expense->category} expense of NPR {$expense->amount} to order #{$order->id}"
        );

        return response()->json([
            'message' => 'Order expense recorded.',
            'data' => ['expense' => $expense],
        ], 201);
    }

    /**
     * Admin: Delete order expense.
     */
    public function deleteOrderExpense(int $orderId, int $expenseId): JsonResponse
    {
        $expense = OrderExpense::where('order_id', $orderId)->findOrFail($expenseId);
        $old = $expense->toArray();
        $expense->delete();

        FinancialAuditLog::log(
            'order_expense_deleted',
            'order_expense',
            $expenseId,
            $old,
            null,
            "Deleted expense of NPR {$expense->amount} from order #{$orderId}"
        );

        return response()->json([
            'message' => 'Expense removed.',
        ]);
    }

    /**
     * Admin: Comprehensive Financial & Earnings Summary.
     * Accurately distinguishes cash collected from estimated order earnings.
     * Does NOT double-count supplier payments as secondary expenses.
     */
    public function financialSummary(): JsonResponse
    {
        // 1. Customer Cash Collected
        $cashCollected = (float) Order::sum('cod_collected_amount');

        // 2. Outstanding Customer Payments (Orders delivered or active where payment is unpaid/partial)
        $unpaidOrders = Order::where('status', '!=', 'cancelled')
            ->whereIn('payment_status', ['unpaid', 'partially_paid'])
            ->get();
        $outstandingCustomerPayments = (float) $unpaidOrders->sum(function ($order) {
            $collected = (float) ($order->cod_collected_amount ?? 0);
            return max(0.0, (float) $order->total - $collected);
        });

        // 3. Wholesale Supplier Plant Costs (for all payable order items)
        $payableItems = OrderItem::where('supplier_obligation_status', '!=', 'waived')->get();
        $totalSupplierCosts = (float) $payableItems->sum(function ($item) {
            return ($item->wholesale_unit_cost ?? 0.0) * $item->quantity;
        });

        // 4. Supplier Payments Made
        $totalSupplierPaymentsMade = (float) SupplierPayment::sum('amount');

        // 5. Remaining Supplier Balances
        $totalSupplierBalances = round($totalSupplierCosts - $totalSupplierPaymentsMade, 2);

        // 6. Recorded Order Operating Expenses (Delivery, packaging, handling)
        $totalRecordedExpenses = (float) OrderExpense::sum('amount');

        // 7. Orders with incomplete cost data
        $incompleteOrdersCount = Order::where('status', '!=', 'cancelled')
            ->where(function ($q) {
                $q->where('earnings_incomplete', true)
                  ->orWhereHas('items', fn ($sub) => $sub->whereNull('wholesale_unit_cost'));
            })
            ->count();

        // 8. Order Revenues
        $totalOrderRevenue = (float) Order::where('status', '!=', 'cancelled')->sum('total');

        // 9. Estimated Order Earnings (Accrual Profit): Total Revenue - Wholesale Plant Costs - Order Expenses
        $estimatedOrderEarnings = round($totalOrderRevenue - $totalSupplierCosts - $totalRecordedExpenses, 2);

        // 10. Realized Cash Earnings: Cash In - Cash Paid to Suppliers - Cash Paid for Expenses
        $realizedCashEarnings = round($cashCollected - $totalSupplierPaymentsMade - $totalRecordedExpenses, 2);

        return response()->json([
            'message' => 'Financial summary generated successfully.',
            'data' => [
                'customer_cash_collected' => round($cashCollected, 2),
                'outstanding_customer_payments' => round($outstandingCustomerPayments, 2),
                'total_supplier_costs' => round($totalSupplierCosts, 2),
                'total_supplier_payments_made' => round($totalSupplierPaymentsMade, 2),
                'supplier_balances_owed' => $totalSupplierBalances,
                'total_recorded_expenses' => round($totalRecordedExpenses, 2),
                'estimated_order_earnings' => $estimatedOrderEarnings,
                'realized_cash_earnings' => $realizedCashEarnings,
                'incomplete_orders_count' => $incompleteOrdersCount,
                'has_incomplete_earnings' => $incompleteOrdersCount > 0,
            ],
        ]);
    }

    /**
     * Admin: Audit log history for financial actions.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = FinancialAuditLog::with('user:id,name,email')
            ->latest()
            ->paginate((int) $request->query('per_page', 50));

        return response()->json([
            'message' => null,
            'data' => [
                'logs' => $logs->items(),
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                    'last_page' => $logs->lastPage(),
                ],
            ],
        ]);
    }
}
