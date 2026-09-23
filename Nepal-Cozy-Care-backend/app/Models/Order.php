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
        'payment_method',
        'promo_code_id',
        'promo_code',
        'discount_amount',
        'subtotal',
        'delivery_fee',
        'tax',
        'total',
        'shipping_name',
        'shipping_phone',
        'shipping_city',
        'shipping_address',
        'delivery_latitude',
        'delivery_longitude',
        'delivery_road_distance_km',
        'delivery_quote_details',
        'location_notes',
        'preferred_contact_method',
        'confirmation_status',
        'confirmation_notes',
        'contacted_at',
        'location_confirmed_at',
        'notification_email_sent_at',
        'notification_email_error',
        'cod_collected_amount',
        'cod_collected_at',
        'cod_collected_by',
        'earnings_incomplete',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'delivery_fee' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'delivery_latitude' => 'float',
        'delivery_longitude' => 'float',
        'delivery_road_distance_km' => 'float',
        'delivery_quote_details' => 'array',
        'cod_collected_amount' => 'float',
        'earnings_incomplete' => 'boolean',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'estimated_delivery_date' => 'datetime',
        'contacted_at' => 'datetime',
        'location_confirmed_at' => 'datetime',
        'notification_email_sent_at' => 'datetime',
        'cod_collected_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function expenses()
    {
        return $this->hasMany(OrderExpense::class);
    }

    public function codCollectedBy()
    {
        return $this->belongsTo(User::class, 'cod_collected_by');
    }
}

