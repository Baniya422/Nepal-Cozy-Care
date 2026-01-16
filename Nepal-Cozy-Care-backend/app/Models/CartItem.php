<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'plant_id',
        'quantity',
        'price'
    ];

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }
}
