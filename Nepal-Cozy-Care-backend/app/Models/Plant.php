<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'scientific_name',
        'category',
        'size',
        'difficulty',
        'light',
        'water',
        'temperature',
        'humidity',
        'rooms',
        'quantity_categories',
        'fertilizer',
        'soil',
        'description',
        'survival_guide',
        'care_instructions',
        'price',
        'stock',
        'image',
        'is_active',
    ];

    protected $casts = [
        'rooms' => 'array',
        'quantity_categories' => 'array',
    ];

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }
}
