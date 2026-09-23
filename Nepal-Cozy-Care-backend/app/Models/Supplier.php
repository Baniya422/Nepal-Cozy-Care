<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function plants(): HasMany
    {
        return $this->hasMany(Plant::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SupplierPayment::class);
    }

    /**
     * Compute current financial snapshot for this supplier.
     */
    public function financialSummary(): array
    {
        // Total plant wholesale costs across payable order items
        $payableItems = $this->orderItems()
            ->where('supplier_obligation_status', '!=', 'waived')
            ->get();

        $totalWholesaleOwed = (float) $payableItems->sum(function ($item) {
            return ($item->wholesale_unit_cost ?? 0.0) * $item->quantity;
        });

        // Total payments recorded
        $totalPaid = (float) $this->payments()->sum('amount');
        $balanceRemaining = round($totalWholesaleOwed - $totalPaid, 2);

        $hasIncompleteCosts = $this->orderItems()
            ->whereNull('wholesale_unit_cost')
            ->exists();

        return [
            'total_wholesale_cost' => round($totalWholesaleOwed, 2),
            'total_paid' => round($totalPaid, 2),
            'balance_remaining' => $balanceRemaining,
            'payable_items_count' => $payableItems->count(),
            'has_incomplete_costs' => $hasIncompleteCosts,
        ];
    }
}
