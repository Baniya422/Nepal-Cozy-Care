<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Plant model representing a plant product in the catalog.
 *
 * @property int $id Unique identifier for this plant
 * @property string $name Common name of the plant
 * @property string|null $scientific_name Scientific/botanical name
 * @property string|null $category Plant category (e.g., 'Succulents', 'Ferns', 'Flowering')
 * @property string|null $size Plant size (e.g., 'Small', 'Medium', 'Large')
 * @property string|null $difficulty Care difficulty level ('beginner', 'intermediate', 'advanced')
 * @property string|null $light Light requirements (e.g., 'bright-light', 'low-light')
 * @property string|null $water Watering needs (e.g., 'low', 'moderate', 'high')
 * @property string|null $temperature Ideal temperature range
 * @property string|null $humidity Ideal humidity level
 * @property string|null $rooms JSON array of suitable rooms/locations
 * @property string|null $quantity_categories JSON array of available quantity options
 * @property string|null $fertilizer Fertilizer recommendations
 * @property string|null $soil Soil requirements
 * @property string|null $description Full product description
 * @property string|null $survival_guide Basic survival tips for new owners
 * @property string|null $care_instructions Detailed care instructions
 * @property float $price Sale price in rupees
 * @property int $stock Current inventory count
 * @property string|null $image Product image URL or path
 * @property bool $is_active Whether this plant is available for purchase
 * @property int $views Total number of times viewed
 * @property \Carbon\Carbon|null $last_viewed_at Last time this plant was viewed
 * @property int $total_sold Total number sold (for bestseller ranking)
 * @property bool $is_popular_item Whether to highlight as popular item
 * @property bool $is_best_seller Whether to highlight as best seller
 * @property \Carbon\Carbon $created_at When this plant was added
 * @property \Carbon\Carbon $updated_at When this plant was last modified
 */
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
        'is_popular_item',
        'is_best_seller',
        'shop_id',
        'supplier_id',
        'wholesale_price',
        'approval_status',
        'rejection_reason',
        'submitted_at',
        'meta_title',
        'meta_description',
    ];

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_ARCHIVED = 'archived';

    protected $casts = [
        'rooms' => 'array',
        'quantity_categories' => 'array',
        'submitted_at' => 'datetime',
        'wholesale_price' => 'float',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function gardenEntries(): HasMany
    {
        return $this->hasMany(GardenEntry::class);
    }

    public function incrementViews()
    {
        $this->increment('views');
        $this->update(['last_viewed_at' => now()]);
    }

    public function scopeMarketplaceApproved($query)
    {
        $isMarketplaceEnabled = AdminSetting::current()->vendor_marketplace_enabled;

        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->where('approval_status', self::STATUS_APPROVED)
                    ->orWhereNull('approval_status');
            })
            ->when(! $isMarketplaceEnabled, function ($q) {
                // If vendor features are disabled, only list Cozy Care direct plants
                $q->whereNull('shop_id');
            }, function ($q) {
                $q->where(function ($sub) {
                    $sub->whereDoesntHave('shop')
                        ->orWhereHas('shop', function ($sq) {
                            $sq->where('status', Shop::STATUS_APPROVED);
                        });
                });
            });
    }


    public function scopeExcludeAccessories($query)
    {
        return $query->whereNotIn('category', ['Pots', 'Tools', 'Soil', 'Fertilizers', 'Accessories'])
            ->where(function ($q) {
                $q->where('category', 'not like', '%pot%')
                    ->where('category', 'not like', '%tool%')
                    ->where('category', 'not like', '%soil%')
                    ->where('category', 'not like', '%fertilizer%')
                    ->where('category', 'not like', '%accessory%');
            });
    }

    public function scopeMostViewed($query)
    {
        return $query->where('is_active', true)
            ->excludeAccessories()
            ->orderBy('views', 'desc')
            ->orderBy('created_at', 'desc');
    }

    public function scopeBestSellers($query)
    {
        return $query->where('is_active', true)
            ->excludeAccessories()
            ->orderBy('total_sold', 'desc')
            ->orderBy('created_at', 'desc');
    }

    public function scopePopularItems($query)
    {
        return $query->where('is_active', true)
            ->where('is_popular_item', true)
            ->excludeAccessories()
            ->orderBy('created_at', 'desc');
    }

    public function scopeShopPlants($query)
    {
        return $query->where('is_active', true)
            ->excludeAccessories()
            ->orderBy('created_at', 'desc');
    }

    public function scopeHomepageBestSellers($query)
    {
        return $query->where('is_active', true)
            ->where('is_best_seller', true)
            ->excludeAccessories()
            ->orderBy('created_at', 'desc');
    }

    public function isAccessory(): bool
    {
        $category = strtolower(trim((string) $this->category));

        return str_contains($category, 'pot')
            || str_contains($category, 'tool')
            || str_contains($category, 'soil')
            || str_contains($category, 'fertilizer')
            || str_contains($category, 'accessory');
    }
}
