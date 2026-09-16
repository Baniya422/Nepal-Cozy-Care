<?php

namespace Database\Seeders;

use App\Models\CareTip;
use App\Models\SeasonalReminder;
use App\Models\User;
use Illuminate\Database\Seeder;

class SeasonalReminderSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::first();
        if (!$admin) {
            return;
        }

        $careTip = CareTip::first();

        $reminders = [
            [
                'title' => 'Monsoon Care: Maximize Airflow & Reduce Watering',
                'season_key' => 'monsoon',
                'city' => 'Kathmandu',
                'priority' => 10,
                'excerpt' => 'Saturated valley humidity means topsoil stays wet for weeks. Open windows for air circulation and check roots before adding water.',
                'content' => "High ambient moisture during the Kathmandu monsoon prevents standard soil evaporation. Rotate pots away from damp corners, ensure drainage holes are completely unblocked, and wipe down large foliage weekly to deter mold and mildew spores.",
                'image' => '/images/winter-garden.png',
                'is_published' => true,
            ],
            [
                'title' => 'Autumn Shift: Prepare Tropicals for Shorter Days',
                'season_key' => 'autumn',
                'city' => null,
                'priority' => 8,
                'excerpt' => 'As daylight hours shorten and nighttime temperatures drop across Nepal, adjust plant placements closer to east and south windows.',
                'content' => "Post-Dashain and Tihar, natural daylight angles shift lower. Move sun-loving houseplants onto bright windowsills to capture gentle autumn sun before winter sets in.",
                'image' => '/images/blog-hero-lush.jpg',
                'is_published' => true,
            ],
            [
                'title' => 'Winter Chill: Protect Foliage from Drafts & Cold Glass',
                'season_key' => 'winter',
                'city' => 'Kathmandu',
                'priority' => 9,
                'excerpt' => 'Keep plants at least 1 foot away from freezing window glass during chilly Himalayan valley winter nights.',
                'content' => "Kathmandu winter nights frequently plunge near freezing. Even well-insulated rooms experience cold radiation next to windowpanes. Pull vulnerable monsteras, ficus, and pothos a few feet inwards.",
                'image' => '/images/winter-garden.png',
                'is_published' => true,
            ],
            [
                'title' => 'Spring Growth: Time to Repot & Refresh Nutrient Soil',
                'season_key' => 'spring',
                'city' => null,
                'priority' => 7,
                'excerpt' => 'As temperatures rise in Chaitra and Baishakh, roots surge with fresh energy. Repot rootbound specimens into one-size-larger planters.',
                'content' => "Spring is the prime season for repotting, dividing root clumps, and beginning your bi-weekly organic liquid fertilizer regimen for radiant new growth.",
                'image' => '/images/about-plants.jpg',
                'is_published' => true,
            ],
            [
                'title' => 'All-Year Golden Habit: Dust Foliage for Maximum Photosynthesis',
                'season_key' => 'all',
                'city' => null,
                'priority' => 5,
                'excerpt' => 'Kathmandu Valley airborne dust blocks up to 35% of leaf sunlight absorption. Wipe leaves with a damp microfiber cloth monthly.',
                'content' => "A soft damp cloth dipped in lukewarm water gently restores natural leaf shine and unblocks stomata without needing artificial wax sprays.",
                'image' => '/images/blog-leaf-macro.jpg',
                'is_published' => true,
            ],
        ];

        foreach ($reminders as $data) {
            SeasonalReminder::updateOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'user_id' => $admin->id,
                    'care_tip_id' => $careTip?->id,
                ])
            );
        }
    }
}
