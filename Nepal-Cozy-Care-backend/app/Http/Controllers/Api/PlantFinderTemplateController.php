<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantFinderTemplate;
use App\Support\PageContentDefaults;

class PlantFinderTemplateController extends Controller
{
    public function show()
    {
        $template = PlantFinderTemplate::query()
            ->where('is_active', true)
            ->latest('id')
            ->first();
        $default = PageContentDefaults::plantFinder();

        if (! $template) {
            return response()->json([
                'message' => 'Plant finder template loaded successfully.',
                'data' => $default,
            ]);
        }

        return response()->json([
            'message' => 'Plant finder template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name ?: $default['name'],
                'room_options' => ! empty($template->room_options) ? $template->room_options : $default['room_options'],
                'light_options' => ! empty($template->light_options) ? $template->light_options : $default['light_options'],
                'experience_options' => ! empty($template->experience_options) ? $template->experience_options : $default['experience_options'],
                'location_options' => ! empty($template->location_options) ? $template->location_options : $default['location_options'],
                'light_map' => ! empty($template->light_map) ? $template->light_map : $default['light_map'],
                'difficulty_map' => ! empty($template->difficulty_map) ? $template->difficulty_map : $default['difficulty_map'],
                'humidity_map' => ! empty($template->humidity_map) ? $template->humidity_map : $default['humidity_map'],
                'room_map' => ! empty($template->room_map) ? $template->room_map : $default['room_map'],
                'non_plant_categories' => ! empty($template->non_plant_categories) ? $template->non_plant_categories : $default['non_plant_categories'],
                'preview_data' => ! empty($template->preview_data) ? $template->preview_data : $default['preview_data'],
            ],
        ]);
    }
}
