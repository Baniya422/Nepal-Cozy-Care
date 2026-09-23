<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'type', // 'percentage' or 'fixed'
        'value',
        'min_subtotal',
        'max_discount',
        'start_date',
        'end_date',
        'total_usage_limit',
        'times_used',
        'per_customer_limit',
        'is_first_order_only',
        'is_active',
    ];

    protected $casts = [
        'value' => 'float',
        'min_subtotal' => 'float',
        'max_discount' => 'float',
        'total_usage_limit' => 'integer',
        'times_used' => 'integer',
        'per_customer_limit' => 'integer',
        'is_first_order_only' => 'boolean',
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(PromoCodeUsage::class);
    }

    /**
     * Check validity for a given subtotal and optional customer/user.
     */
    public function evaluateEligibility(float $subtotal, ?User $user = null): array
    {
        if (! $this->is_active) {
            return ['eligible' => false, 'message' => 'This promo code is currently inactive.'];
        }

        $now = now();
        if ($this->start_date && $now->lt($this->start_date)) {
            return ['eligible' => false, 'message' => 'This promo code is not active yet.'];
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return ['eligible' => false, 'message' => 'This promo code has expired.'];
        }

        if ($this->min_subtotal > 0 && $subtotal < $this->min_subtotal) {
            return [
                'eligible' => false,
                'message' => 'Minimum subtotal of NPR '.number_format($this->min_subtotal, 2).' is required for this promo code.',
            ];
        }

        if ($this->total_usage_limit !== null && $this->times_used >= $this->total_usage_limit) {
            return ['eligible' => false, 'message' => 'This promo code has reached its maximum total usage limit.'];
        }

        if ($this->is_first_order_only) {
            if (! $user) {
                return ['eligible' => false, 'message' => 'Please log in to use this first-order promo code.'];
            }
            $existingOrdersCount = Order::where('user_id', $user->id)
                ->where('status', '!=', 'cancelled')
                ->count();
            if ($existingOrdersCount > 0) {
                return ['eligible' => false, 'message' => 'This promo code is only valid for your first order.'];
            }
        }

        if ($this->per_customer_limit > 0 && $user) {
            $userUsage = PromoCodeUsage::where('promo_code_id', $this->id)
                ->where('user_id', $user->id)
                ->count();
            if ($userUsage >= $this->per_customer_limit) {
                return ['eligible' => false, 'message' => 'You have already reached the usage limit for this promo code.'];
            }
        }

        // Calculate discount
        $discount = 0.0;
        if ($this->type === 'percentage') {
            $discount = round(($subtotal * $this->value) / 100, 2);
            if ($this->max_discount !== null && $discount > $this->max_discount) {
                $discount = (float) $this->max_discount;
            }
        } else {
            // Fixed NPR discount
            $discount = min((float) $this->value, $subtotal);
        }

        return [
            'eligible' => true,
            'discount' => round($discount, 2),
            'discounted_subtotal' => max(0.0, round($subtotal - $discount, 2)),
            'message' => 'Promo code applied successfully!',
        ];
    }
}
