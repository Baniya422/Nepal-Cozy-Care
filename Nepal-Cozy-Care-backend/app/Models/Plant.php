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
        'views',
        'last_viewed_at',
        'total_sold',
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

    // Increment view count for this plant
    public function incrementViews()
    {
        $this->increment('views');
        $this->update(['last_viewed_at' => now()]);
    }

    // Get popular items sorted by views
    public function scopeMostViewed($query)
    {
        return $query->where('is_active', true)
            ->orderBy('views', 'desc')
            ->orderBy('created_at', 'desc');
    }

    // Get best sellers sorted by total_sold
    public function scopeBestSellers($query)
    {
        return $query->where('is_active', true)
            ->orderBy('total_sold', 'desc')
            ->orderBy('created_at', 'desc');
    }
}
