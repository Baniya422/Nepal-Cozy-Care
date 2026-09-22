<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Decoration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'description',
        'suitable_room_types',
        'width',
        'depth',
        'height',
        'default_color',
        'thumbnail_url',
        'model_url',
        'model_scale',
        'model_rotation_offset',
        'floor_alignment',
        'plant_id',
        'product_id',
        'status',
        'source_type',
    ];

    protected $casts = [
        'suitable_room_types' => 'array',
        'width' => 'float',
        'depth' => 'float',
        'height' => 'float',
        'model_scale' => 'float',
        'model_rotation_offset' => 'float',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->slug)) {
                $item->slug = Str::slug($item->name) . '-' . Str::random(5);
            }
        });
    }

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['published', 'draft']);
    }
}
