<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Garden Entry model representing a plant in a user's personal garden.
 *
 * @property int $id Unique identifier for this garden entry
 * @property int $user_id Foreign key to the user who owns this entry
 * @property int $plant_id Foreign key to the plant type being tracked
 * @property int|null $source_order_id Foreign key to the order this plant came from (if purchased)
 * @property string|null $nickname User's custom name for this plant instance
 * @property string|null $city City/location where the plant is kept
 * @property string|null $room Room or area where the plant is placed
 * @property string|null $notes User's notes about the plant's condition or history
 * @property int $quantity How many of this plant the user has
 * @property \Carbon\Carbon|null $last_watered_at Last date the plant was watered
 * @property \Carbon\Carbon|null $last_fertilized_at Last date the plant was fertilized
 * @property int|null $watering_frequency_days How often the plant needs watering (in days)
 * @property int|null $fertilizing_frequency_days How often the plant needs fertilizing (in days)
 * @property \Carbon\Carbon|null $acquired_at When the user got this plant
 * @property \Carbon\Carbon $created_at When this entry was created
 * @property \Carbon\Carbon $updated_at When this entry was last modified
 */
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
