<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareTip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'category',
        'difficulty',
        'plant_ids',
        'views_count',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'plant_ids' => 'array',
    ];

    // Relationships
    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function plants()
    {
        return $this->belongsToMany(Plant::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeByPlant($query, $plantId)
    {
        return $query->whereJsonContains('plant_ids', $plantId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('excerpt', 'like', "%{$search}%")
              ->orWhere('content', 'like', "%{$search}%");
        });
    }

    // Category labels
    public static function getCategories(): array
    {
        return [
            'watering' => 'Watering',
            'fertilizing' => 'Fertilizing',
            'pest_control' => 'Pest Control',
            'indoor' => 'Indoor Plants',
            'outdoor' => 'Outdoor Plants',
            'seasonal' => 'Seasonal Care',
        ];
    }

    // Difficulty labels
    public static function getDifficulties(): array
    {
        return [
            'beginner' => 'Beginner',
            'intermediate' => 'Intermediate',
            'advanced' => 'Advanced',
        ];
    }

    // Get category label
    public function getCategoryLabel(): string
    {
        return self::getCategories()[$this->category] ?? $this->category;
    }

    // Get difficulty label
    public function getDifficultyLabel(): string
    {
        return self::getDifficulties()[$this->difficulty] ?? $this->difficulty;
    }
}
