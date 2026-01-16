<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'plant_id',
        'quantity',
        'price',
        'line_total',
    ];

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
