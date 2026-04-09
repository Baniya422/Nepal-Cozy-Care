<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantHealthTemplate;

class PlantHealthTemplateController extends Controller
{
    public function show()
    {
        $template = PlantHealthTemplate::query()
            ->where('is_active', true)
            ->latest('id')
            ->first();

        if (! $template) {
            return response()->json([
                'message' => 'No active plant health template found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Plant health template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name,
                'symptom_categories' => $template->symptom_categories,
                'plant_type_options' => $template->plant_type_options,
                'environment_options' => $template->environment_options,
                'soil_options' => $template->soil_options,
                'season_options' => $template->season_options,
                'diagnosis_profiles' => $template->diagnosis_profiles,
                'default_diagnosis' => $template->default_diagnosis,
                'healthy_plant_habits' => $template->healthy_plant_habits,
            ],
        ]);
    }
}
