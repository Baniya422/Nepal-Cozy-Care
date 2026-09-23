<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantHealthTemplate;
use App\Support\PageContentDefaults;

class PlantHealthTemplateController extends Controller
{
    public function show()
    {
        $template = PlantHealthTemplate::query()
            ->where('is_active', true)
            ->latest('id')
            ->first();
        $default = PageContentDefaults::plantHealth();

        if (! $template) {
            return response()->json([
                'message' => 'Plant health template loaded successfully.',
                'data' => $default,
            ]);
        }

        return response()->json([
            'message' => 'Plant health template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name ?: $default['name'],
                'symptom_categories' => ! empty($template->symptom_categories) ? $template->symptom_categories : $default['symptom_categories'],
                'plant_type_options' => ! empty($template->plant_type_options) ? $template->plant_type_options : $default['plant_type_options'],
                'environment_options' => ! empty($template->environment_options) ? $template->environment_options : $default['environment_options'],
                'soil_options' => ! empty($template->soil_options) ? $template->soil_options : $default['soil_options'],
                'season_options' => ! empty($template->season_options) ? $template->season_options : $default['season_options'],
                'diagnosis_profiles' => ! empty($template->diagnosis_profiles) ? $template->diagnosis_profiles : $default['diagnosis_profiles'],
                'default_diagnosis' => ! empty($template->default_diagnosis) ? $template->default_diagnosis : $default['default_diagnosis'],
                'healthy_plant_habits' => ! empty($template->healthy_plant_habits) ? $template->healthy_plant_habits : $default['healthy_plant_habits'],
            ],
        ]);
    }
}
