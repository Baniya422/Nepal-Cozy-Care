<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'tracking_number',
        'courier_name',
        'courier_tracking_url',
        'packed_at',
        'shipped_at',
        'out_for_delivery_at',
        'delivered_at',
        'estimated_delivery_date',
        'payment_status',
        'subtotal',
        'delivery_fee',
        'tax',
        'total',
        'shipping_name',
        'shipping_phone',
        'shipping_city',
        'shipping_address',
        'location_notes',
        'preferred_contact_method',
        'confirmation_status',
        'confirmation_notes',
        'contacted_at',
        'location_confirmed_at',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'estimated_delivery_date' => 'datetime',
        'contacted_at' => 'datetime',
        'location_confirmed_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
