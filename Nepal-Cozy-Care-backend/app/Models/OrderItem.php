<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'plant_id',
        'shop_id',
        'product_name',
        'shop_name',
        'quantity',
        'price',
        'line_total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float',
        'line_total' => 'float',
    ];

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
