<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plant_finder_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Plant Finder Template');
            $table->boolean('is_active')->default(true);
            $table->json('room_options');
            $table->json('light_options');
            $table->json('experience_options');
            $table->json('location_options');
            $table->json('light_map');
            $table->json('difficulty_map');
            $table->json('humidity_map');
            $table->json('room_map');
            $table->json('non_plant_categories');
            $table->json('preview_data');
            $table->timestamps();
        });

        DB::table('plant_finder_templates')->insert([
            'name' => 'Starter Plant Finder Template',
            'is_active' => true,
            'room_options' => json_encode([
                ['value' => 'bedroom', 'label' => 'Bedroom'],
                ['value' => 'living-room', 'label' => 'Living Room'],
                ['value' => 'kitchen', 'label' => 'Kitchen'],
                ['value' => 'bathroom', 'label' => 'Bathroom'],
                ['value' => 'office', 'label' => 'Office'],
                ['value' => 'balcony', 'label' => 'Balcony'],
            ]),
            'light_options' => json_encode([
                ['value' => 'bright-light', 'label' => 'Bright Light'],
                ['value' => 'medium-light', 'label' => 'Medium Light'],
                ['value' => 'low-light', 'label' => 'Low Light'],
                ['value' => 'indirect-light', 'label' => 'Indirect Light'],
            ]),
            'experience_options' => json_encode([
                ['value' => 'beginner', 'label' => 'Beginner'],
                ['value' => 'intermediate', 'label' => 'Intermediate'],
                ['value' => 'expert', 'label' => 'Expert'],
            ]),
            'location_options' => json_encode([
                ['value' => 'dry', 'label' => "it's usually dry"],
                ['value' => 'humid', 'label' => "it's usually humid"],
                ['value' => 'normal', 'label' => "it's normal humidity"],
            ]),
            'light_map' => json_encode([
                'bright-light' => 'Bright Light',
                'medium-light' => 'Medium Light',
                'low-light' => 'Low Light',
                'indirect-light' => 'Indirect Light',
            ]),
            'difficulty_map' => json_encode([
                'beginner' => 'Easy',
                'intermediate' => 'Medium',
                'expert' => 'Hard',
            ]),
            'humidity_map' => json_encode([
                'dry' => 'Dry',
                'humid' => 'Humid',
                'normal' => 'Normal',
            ]),
            'room_map' => json_encode([
                'bedroom' => 'Bedroom',
                'living-room' => 'Living Room',
                'kitchen' => 'Kitchen',
                'bathroom' => 'Bathroom',
                'office' => 'Office',
                'balcony' => 'Balcony',
            ]),
            'non_plant_categories' => json_encode([
                'Pots',
                'Tools',
                'Soil',
                'Fertilizers',
                'Accessories',
            ]),
            'preview_data' => json_encode([
                'room' => [
                    '' => [
                        'eyebrow' => 'Pick the room first',
                        'title' => "Preview your plant's new home",
                        'description' => 'Selecting a room updates this panel so the quiz feels guided instead of empty.',
                        'image' => 'default.png',
                    ],
                    'bedroom' => [
                        'eyebrow' => 'Quiet and restful',
                        'title' => 'Bedroom setup',
                        'description' => 'Soft corners, calmer light, and low-fuss greenery usually work best here.',
                        'image' => 'bedroom.png',
                    ],
                    'living-room' => [
                        'eyebrow' => 'Open and social',
                        'title' => 'Living room setup',
                        'description' => 'This space can support larger statement plants, especially near filtered light.',
                        'image' => 'living-room.png',
                    ],
                    'kitchen' => [
                        'eyebrow' => 'Warm and practical',
                        'title' => 'Kitchen setup',
                        'description' => 'Choose plants that can handle brighter pockets, routine, and a little daily activity.',
                        'image' => 'kitchen.png',
                    ],
                    'bathroom' => [
                        'eyebrow' => 'Moisture-friendly',
                        'title' => 'Bathroom setup',
                        'description' => 'Humidity-loving plants usually feel more at home in this kind of environment.',
                        'image' => 'bathroom.png',
                    ],
                    'office' => [
                        'eyebrow' => 'Focused and tidy',
                        'title' => 'Office setup',
                        'description' => 'Structured plants that stay neat and tolerate routine placement fit well here.',
                        'image' => 'office.png',
                    ],
                    'balcony' => [
                        'eyebrow' => 'Airy and bright',
                        'title' => 'Balcony setup',
                        'description' => 'This is the best match for sun-ready plants that enjoy stronger exposure and airflow.',
                        'image' => 'balcony.png',
                    ],
                ],
                'light' => [
                    '' => [
                        'eyebrow' => 'Check the windows',
                        'title' => 'Light levels',
                        'description' => 'How much natural sunlight does this particular spot receive?',
                        'image' => 'default.png',
                    ],
                    'bright-light' => [
                        'eyebrow' => 'Sun-drenched',
                        'title' => 'Bright Light',
                        'description' => 'Direct sunlight for most of the day. Perfect for sun-loving plants and cacti.',
                        'image' => 'bright-light.png',
                    ],
                    'medium-light' => [
                        'eyebrow' => 'Balanced',
                        'title' => 'Medium Light',
                        'description' => 'A few hours of direct sun or bright filtered light throughout the day.',
                        'image' => 'medium-light.png',
                    ],
                    'low-light' => [
                        'eyebrow' => 'Shady',
                        'title' => 'Low Light',
                        'description' => 'Little to no direct sunlight. Great for hardy, adaptable plants.',
                        'image' => 'low-light.png',
                    ],
                    'indirect-light' => [
                        'eyebrow' => 'Gentle rays',
                        'title' => 'Indirect Light',
                        'description' => 'Bright light that is filtered or bounced, avoiding harsh direct sun.',
                        'image' => 'indirect-light.png',
                    ],
                ],
                'experience' => [
                    '' => [
                        'eyebrow' => 'Your comfort zone',
                        'title' => 'Experience level',
                        'description' => 'How confident are you with keeping plants alive?',
                        'image' => 'default.png',
                    ],
                    'beginner' => [
                        'eyebrow' => 'Just starting',
                        'title' => 'Beginner Plant Parent',
                        'description' => 'Low-maintenance plants that are forgiving if you forget a watering or two.',
                        'image' => 'beginner.png',
                    ],
                    'intermediate' => [
                        'eyebrow' => 'Getting the hang of it',
                        'title' => 'Intermediate',
                        'description' => 'You know the basics and are ready for plants with a few specific needs.',
                        'image' => 'intermediate.png',
                    ],
                    'expert' => [
                        'eyebrow' => 'Green thumb',
                        'title' => 'Plant Expert',
                        'description' => "You're ready for high-maintenance, rare, or fuzzy beauties.",
                        'image' => 'expert.png',
                    ],
                ],
                'location' => [
                    '' => [
                        'eyebrow' => 'Air quality',
                        'title' => 'Home Humidity',
                        'description' => 'What is the moisture level like in your home?',
                        'image' => 'default.png',
                    ],
                    'dry' => [
                        'eyebrow' => 'Crisp air',
                        'title' => 'Usually dry',
                        'description' => "Great for succulents, cacti, and plants that don't need misting.",
                        'image' => 'dry.png',
                    ],
                    'humid' => [
                        'eyebrow' => 'Tropical feel',
                        'title' => 'Usually humid',
                        'description' => 'Perfect for ferns, calatheas, and other moisture-loving tropicals.',
                        'image' => 'humid.png',
                    ],
                    'normal' => [
                        'eyebrow' => 'Standard indoor',
                        'title' => 'Normal humidity',
                        'description' => 'Balanced environment where most common houseplants will thrive.',
                        'image' => 'normal.png',
                    ],
                ],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('plant_finder_templates');
    }
};
