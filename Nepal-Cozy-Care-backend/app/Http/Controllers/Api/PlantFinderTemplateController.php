<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantFinderTemplate;

class PlantFinderTemplateController extends Controller
{
    public function show()
    {
        $template = PlantFinderTemplate::query()
            ->where('is_active', true)
            ->latest('id')
            ->first();

        if (! $template) {
            return response()->json([
                'message' => 'No active plant finder template found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Plant finder template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name,
                'room_options' => $template->room_options,
                'light_options' => $template->light_options,
                'experience_options' => $template->experience_options,
                'location_options' => $template->location_options,
                'light_map' => $template->light_map,
                'difficulty_map' => $template->difficulty_map,
                'humidity_map' => $template->humidity_map,
                'room_map' => $template->room_map,
                'non_plant_categories' => $template->non_plant_categories,
                'preview_data' => $template->preview_data,
            ],
        ]);
    }
}
