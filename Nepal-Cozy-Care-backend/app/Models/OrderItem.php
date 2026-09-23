<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'plant_id',
        'shop_id',
        'supplier_id',
        'product_name',
        'shop_name',
        'supplier_name',
        'wholesale_unit_cost',
        'supplier_obligation_status',
        'supplier_payout_status',
        'quantity',
        'price',
        'line_total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float',
        'line_total' => 'float',
        'wholesale_unit_cost' => 'float',
    ];

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

