<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantFinderTemplate extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'room_options',
        'light_options',
        'experience_options',
        'location_options',
        'light_map',
        'difficulty_map',
        'humidity_map',
        'room_map',
        'non_plant_categories',
        'preview_data',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'room_options' => 'array',
        'light_options' => 'array',
        'experience_options' => 'array',
        'location_options' => 'array',
        'light_map' => 'array',
        'difficulty_map' => 'array',
        'humidity_map' => 'array',
        'room_map' => 'array',
        'non_plant_categories' => 'array',
        'preview_data' => 'array',
    ];
}
