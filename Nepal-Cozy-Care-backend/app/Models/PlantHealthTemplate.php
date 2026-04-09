<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantHealthTemplate extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'symptom_categories',
        'plant_type_options',
        'environment_options',
        'soil_options',
        'season_options',
        'diagnosis_profiles',
        'default_diagnosis',
        'healthy_plant_habits',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'symptom_categories' => 'array',
        'plant_type_options' => 'array',
        'environment_options' => 'array',
        'soil_options' => 'array',
        'season_options' => 'array',
        'diagnosis_profiles' => 'array',
        'default_diagnosis' => 'array',
        'healthy_plant_habits' => 'array',
    ];
}
