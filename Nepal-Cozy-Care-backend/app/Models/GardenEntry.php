<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GardenEntry extends Model
{
    protected $fillable = [
        'user_id',
        'plant_id',
        'source_order_id',
        'nickname',
        'city',
        'room',
        'notes',
        'quantity',
        'last_watered_at',
        'last_fertilized_at',
        'watering_frequency_days',
        'fertilizing_frequency_days',
        'acquired_at',
    ];

    protected $casts = [
        'last_watered_at' => 'datetime',
        'last_fertilized_at' => 'datetime',
        'acquired_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    public function sourceOrder()
    {
        return $this->belongsTo(Order::class, 'source_order_id');
    }
}
