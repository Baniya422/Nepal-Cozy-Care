<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plant_health_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Plant Health Template');
            $table->boolean('is_active')->default(true);
            $table->json('symptom_categories');
            $table->json('plant_type_options');
            $table->json('environment_options');
            $table->json('soil_options');
            $table->json('season_options');
            $table->json('diagnosis_profiles');
            $table->json('default_diagnosis');
            $table->json('healthy_plant_habits');
            $table->timestamps();
        });

        DB::table('plant_health_templates')->insert([
            'name' => 'Starter Plant Health Template',
            'is_active' => true,
            'symptom_categories' => json_encode([
                [
                    'id' => 'leaves',
                    'name' => 'Leaf Problems',
                    'icon' => 'Leaf',
                    'symptoms' => [
                        ['id' => 'yellow_leaves', 'name' => 'Yellow Leaves', 'description' => 'Leaves turning yellow'],
                        ['id' => 'brown_tips', 'name' => 'Brown Leaf Tips', 'description' => 'Brown or crispy leaf edges'],
                        ['id' => 'drooping', 'name' => 'Drooping Leaves', 'description' => 'Leaves hanging down'],
                        ['id' => 'spots', 'name' => 'Brown/Black Spots', 'description' => 'Discolored spots on leaves'],
                    ],
                ],
                [
                    'id' => 'water',
                    'name' => 'Watering Issues',
                    'icon' => 'Droplets',
                    'symptoms' => [
                        ['id' => 'overwatering', 'name' => 'Overwatering', 'description' => 'Soil constantly wet, soggy'],
                        ['id' => 'underwatering', 'name' => 'Underwatering', 'description' => 'Dry soil, wilting'],
                        ['id' => 'root_rot', 'name' => 'Root Rot Signs', 'description' => 'Foul smell, mushy stems'],
                        ['id' => 'water_quality', 'name' => 'Water Quality', 'description' => 'Brown tips from tap water'],
                    ],
                ],
                [
                    'id' => 'light',
                    'name' => 'Light & Environment',
                    'icon' => 'Sun',
                    'symptoms' => [
                        ['id' => 'leggy', 'name' => 'Leggy Growth', 'description' => 'Stretched, sparse stems'],
                        ['id' => 'sunburn', 'name' => 'Sunburn', 'description' => 'Brown, crispy patches'],
                        ['id' => 'pale', 'name' => 'Pale/Light Green', 'description' => 'Loss of vibrant color'],
                        ['id' => 'no_growth', 'name' => 'No New Growth', 'description' => 'Stagnant plant'],
                    ],
                ],
                [
                    'id' => 'pests',
                    'name' => 'Pests & Diseases',
                    'icon' => 'Bug',
                    'symptoms' => [
                        ['id' => 'aphids', 'name' => 'Tiny Bugs', 'description' => 'Small insects on leaves or stems'],
                        ['id' => 'spider_mites', 'name' => 'Spider Webs', 'description' => 'Fine webbing on plant'],
                        ['id' => 'fungus_gnats', 'name' => 'Flying Insects', 'description' => 'Small flies around soil'],
                        ['id' => 'mealybugs', 'name' => 'White Cottony Patches', 'description' => 'White fuzzy clusters'],
                    ],
                ],
                [
                    'id' => 'environment',
                    'name' => 'Temperature & Humidity',
                    'icon' => 'Thermometer',
                    'symptoms' => [
                        ['id' => 'cold_damage', 'name' => 'Cold Damage', 'description' => 'Blackened or mushy areas'],
                        ['id' => 'heat_stress', 'name' => 'Heat Stress', 'description' => 'Wilting in hot conditions'],
                        ['id' => 'low_humidity', 'name' => 'Low Humidity', 'description' => 'Crispy edges or browning'],
                        ['id' => 'draft', 'name' => 'Draft Sensitivity', 'description' => 'Damage near windows, vents, or AC'],
                    ],
                ],
            ]),
            'plant_type_options' => json_encode([
                ['id' => 'general', 'label' => 'General Houseplant'],
                ['id' => 'tropical', 'label' => 'Tropical Foliage'],
                ['id' => 'succulent', 'label' => 'Succulent / Cactus'],
                ['id' => 'flowering', 'label' => 'Flowering Plant'],
                ['id' => 'fern', 'label' => 'Fern / Humidity Lover'],
            ]),
            'environment_options' => json_encode([
                ['id' => 'living_room', 'label' => 'Living Room'],
                ['id' => 'bedroom', 'label' => 'Bedroom'],
                ['id' => 'bathroom', 'label' => 'Bathroom'],
                ['id' => 'office', 'label' => 'Office'],
                ['id' => 'balcony', 'label' => 'Balcony'],
                ['id' => 'window', 'label' => 'Near Bright Window'],
            ]),
            'soil_options' => json_encode([
                ['id' => 'unknown', 'label' => 'Not sure'],
                ['id' => 'wet', 'label' => 'Wet / Soggy'],
                ['id' => 'normal', 'label' => 'Lightly moist'],
                ['id' => 'dry', 'label' => 'Dry'],
            ]),
            'season_options' => json_encode([
                ['id' => 'spring', 'label' => 'Spring'],
                ['id' => 'summer', 'label' => 'Summer'],
                ['id' => 'monsoon', 'label' => 'Monsoon'],
                ['id' => 'autumn', 'label' => 'Autumn'],
                ['id' => 'winter', 'label' => 'Winter'],
            ]),
            'diagnosis_profiles' => json_encode([
                [
                    'id' => 'overwatering',
                    'title' => 'Overwatering or Early Root Rot',
                    'summary' => 'Your plant is likely staying wet for too long, which can weaken roots and cause yellowing and drooping.',
                    'severity' => 'high',
                    'symptoms' => ['overwatering', 'root_rot', 'yellow_leaves', 'drooping', 'fungus_gnats', 'spots'],
                    'immediateActions' => [
                        'Pause watering and check root-zone moisture.',
                        'Empty any standing water from trays.',
                        'Inspect roots quickly if stems feel soft.',
                    ],
                    'causes' => [
                        'Watering too frequently',
                        'Poor drainage',
                        'Low airflow during humid weather',
                    ],
                    'solutions' => [
                        'Let top soil dry before next watering',
                        'Repot into a faster-draining mix if needed',
                        'Trim damaged roots and leaves',
                    ],
                    'prevention' => [
                        'Always check soil first',
                        'Use drainage holes',
                        'Adjust watering by season',
                    ],
                    'relatedCareTips' => ['watering', 'pest_control'],
                    'contextBoosts' => [
                        'plantTypes' => ['succulent'],
                        'environments' => ['bathroom'],
                        'seasons' => ['monsoon', 'winter'],
                        'soilStates' => ['wet'],
                    ],
                ],
                [
                    'id' => 'underwatering',
                    'title' => 'Underwatering and Dry Stress',
                    'summary' => 'The plant is likely drying out too fast, causing wilting, brown tips, and curling.',
                    'severity' => 'medium',
                    'symptoms' => ['underwatering', 'drooping', 'brown_tips', 'curling', 'falling'],
                    'immediateActions' => [
                        'Water deeply until excess drains out.',
                        'Check if soil has pulled away from pot edges.',
                        'Move away from harsh heat while recovering.',
                    ],
                    'causes' => [
                        'Infrequent watering',
                        'Small pots drying quickly',
                        'Hot, dry room conditions',
                    ],
                    'solutions' => [
                        'Fully rehydrate soil',
                        'Review dry-down speed in that room',
                        'Increase humidity for sensitive plants',
                    ],
                    'prevention' => [
                        'Check soil weekly',
                        'Monitor more often in summer',
                        'Set reminders for thirsty plants',
                    ],
                    'relatedCareTips' => ['watering', 'indoor'],
                    'contextBoosts' => [
                        'environments' => ['balcony', 'window'],
                        'seasons' => ['summer'],
                        'soilStates' => ['dry'],
                    ],
                ],
                [
                    'id' => 'low_light',
                    'title' => 'Low Light Stress',
                    'summary' => 'Not enough usable light can slow growth and cause pale color or leggy stems.',
                    'severity' => 'low',
                    'symptoms' => ['leggy', 'pale', 'no_growth', 'falling'],
                    'immediateActions' => [
                        'Move plant closer to bright indirect light.',
                        'Rotate weekly for balanced growth.',
                        'Pause heavy fertilizer until light improves.',
                    ],
                    'causes' => [
                        'Placement too far from a window',
                        'Blocked sunlight',
                        'Short winter days',
                    ],
                    'solutions' => [
                        'Relocate to brighter area',
                        'Use grow light if needed',
                        'Prune stretched stems',
                    ],
                    'prevention' => [
                        'Match plant to room brightness',
                        'Re-check placement seasonally',
                        'Pick lower-light plants for dim spots',
                    ],
                    'relatedCareTips' => ['indoor'],
                    'contextBoosts' => [
                        'plantTypes' => ['flowering'],
                        'environments' => ['office', 'bathroom'],
                        'seasons' => ['winter'],
                    ],
                ],
                [
                    'id' => 'sap_pests',
                    'title' => 'Sap-Sucking Pest Infestation',
                    'summary' => 'Sticky residue or tiny clusters often mean a pest issue that needs early treatment.',
                    'severity' => 'medium',
                    'symptoms' => ['aphids', 'mealybugs', 'yellow_leaves', 'curling'],
                    'immediateActions' => [
                        'Isolate the plant.',
                        'Inspect leaf joints and undersides.',
                        'Wipe visible pests first.',
                    ],
                    'causes' => [
                        'New plants introducing pests',
                        'Plant stress',
                        'Soft overfed growth',
                    ],
                    'solutions' => [
                        'Use insecticidal soap or neem treatment',
                        'Repeat treatment on schedule',
                        'Inspect nearby plants',
                    ],
                    'prevention' => [
                        'Quarantine new plants',
                        'Inspect weekly',
                        'Avoid excessive fertilizer',
                    ],
                    'relatedCareTips' => ['pest_control'],
                    'contextBoosts' => [
                        'plantTypes' => ['flowering', 'tropical'],
                        'seasons' => ['spring', 'summer'],
                    ],
                ],
            ]),
            'default_diagnosis' => json_encode([
                'id' => 'general_stress',
                'title' => 'General Plant Stress',
                'summary' => 'Your plant is stressed, but symptoms do not strongly match one issue yet.',
                'severity' => 'medium',
                'symptoms' => [],
                'immediateActions' => [
                    'Inspect roots, moisture, and light together.',
                    'Avoid too many changes at once.',
                    'Watch for new symptoms over a few days.',
                ],
                'causes' => [
                    'Mixed environmental stress',
                    'Early-stage issue still developing',
                    'Multiple small issues at once',
                ],
                'solutions' => [
                    'Review watering and placement first',
                    'Inspect leaves and soil surface carefully',
                    'Use category care tips for follow-up',
                ],
                'prevention' => [
                    'Track care changes consistently',
                    'Check plants weekly',
                    'Adjust routines gradually',
                ],
                'relatedCareTips' => ['indoor', 'watering'],
            ]),
            'healthy_plant_habits' => json_encode([
                [
                    'title' => 'Check Soil Before Watering',
                    'description' => 'Water based on real soil moisture, not memory.',
                    'icon' => 'Droplets',
                ],
                [
                    'title' => 'Match The Plant To The Room',
                    'description' => 'Correct light and airflow matter more than decoration.',
                    'icon' => 'Sun',
                ],
                [
                    'title' => 'Inspect Weekly',
                    'description' => 'Catch pests and stress early with a quick weekly check.',
                    'icon' => 'Wind',
                ],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('plant_health_templates');
    }
};
