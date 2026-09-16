<?php

namespace Database\Seeders;

use App\Models\CareTip;
use App\Models\Plant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CareTipSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::first();
        if (!$admin) {
            return;
        }

        $monstera = Plant::where('name', 'Monstera Deliciosa')->first();
        $snake = Plant::where('name', 'Snake Plant Laurentii')->first();
        $lily = Plant::where('name', 'Peace Lily Sensation')->first();

        $tips = [
            [
                'title' => 'The Golden Rule of Finger-Testing Soil Moisture',
                'slug' => 'golden-rule-soil-moisture-test',
                'category' => 'watering',
                'difficulty' => 'beginner',
                'excerpt' => 'Never water on a calendar schedule. Learn the simple 2-inch tactile test that prevents 90% of houseplant deaths.',
                'content' => "Rigid weekly watering schedules cause more indoor plant fatalities than underwatering. Ambient room humidity, seasonal temperature shifts, and container porosity dictate water absorption speed.\n\n### How to Test Accurately\n1. Gently insert your index finger two inches into the potting medium near the mid-rim.\n2. If the soil feels cool, dark, and sticks to your skin, wait 2 to 3 days before re-checking.\n3. If it feels completely dry and crumbly through the top 2 inches, take your plant to the sink or use a long-spout watering can to saturate until water drains freely from the bottom holes.",
                'image' => '/images/blog-leaf-macro.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 520,
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Monsoon Care: Humidity, Ventilation & Root Rot Prevention',
                'slug' => 'monsoon-care-humidity-and-ventilation',
                'category' => 'seasonal',
                'difficulty' => 'intermediate',
                'excerpt' => 'During Nepal\'s monsoon season, indoor air reaches 85%+ humidity. Adapt your watering and spacing to avoid fungal growth.',
                'content' => "High monsoon humidity slows down soil evaporation dramatically. Plants that drank weekly in May might only need water once every 14–18 days during July and August.\n\n### Essential Monsoon Steps\n- **Air Circulation**: Turn on ceiling fans or open windows for gentle cross-breezes.\n- **Space Them Out**: Do not pack pots tightly together. Give each plant breathing space.\n- **Hold the Fertilizer**: Most plants slow their uptake during overcast monsoon days.",
                'image' => '/images/about-plants.jpg',
                'plant_ids' => $snake ? [$snake->id] : [],
                'views_count' => 640,
                'is_published' => true,
                'published_at' => now()->subDays(3),
            ],
            [
                'title' => 'Organic Neem Oil Emulsion for Aphids and Spider Mites',
                'slug' => 'organic-neem-oil-pest-spray',
                'category' => 'pest_control',
                'difficulty' => 'beginner',
                'excerpt' => 'Safely eradicate indoor pests with an eco-friendly cold-pressed neem oil recipe safe for pets and children.',
                'content' => "When tiny spider mites, scale insects, or mealybugs appear on leaf undersides, reach for natural neem oil rather than harsh chemical sprays.\n\n### The Proven Formula\n- 1 Liter of lukewarm water\n- 5ml pure cold-pressed neem oil\n- 2-3 drops of mild natural liquid soap (emulsifier)\n\nShake vigorously and spray thoroughly over both sides of the leaves and stems in the evening, away from direct sunlight.",
                'image' => '/images/blog-hero-lush.jpg',
                'plant_ids' => $lily ? [$lily->id] : [],
                'views_count' => 410,
                'is_published' => true,
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Indoor Houseplant Fertilization: Spring & Summer Protocol',
                'slug' => 'houseplant-fertilization-protocol',
                'category' => 'fertilizing',
                'difficulty' => 'intermediate',
                'excerpt' => 'Nutrient ratios, timing, and why half-strength fertilizer beats full-strength burns every single time.',
                'content' => "Potted plants have limited root volume and cannot seek out new soil minerals. Regular feeding during active growth seasons (Chaitra to Ashwin) keeps foliage radiant and deep green.\n\nAlways dilute balanced 20-20-20 or seaweed liquid fertilizer to half the manufacturer recommendation to avoid root burn.",
                'image' => '/images/rubber.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 380,
                'is_published' => true,
                'published_at' => now()->subDays(10),
            ],
        ];

        foreach ($tips as $tipData) {
            CareTip::updateOrCreate(
                ['slug' => $tipData['slug']],
                array_merge($tipData, ['user_id' => $admin->id])
            );
        }
    }
}
