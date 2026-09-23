<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'category', // 'delivery', 'packaging', 'transport', 'handling', 'other'
        'amount',
        'description',
        'recorded_at',
        'recorded_by',
    ];

    protected $casts = [
        'amount' => 'float',
        'recorded_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
