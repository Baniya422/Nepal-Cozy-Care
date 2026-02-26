<?php

namespace Database\Seeders;

use App\Models\Plant;
use Illuminate\Database\Seeder;

class PlantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plants = [
            [
                'name' => 'Monstera Deliciosa',
                'scientific_name' => 'Monstera deliciosa',
                'description' => 'A popular tropical plant known for its unique split leaves.',
                'price' => 29.99,
                'stock' => 50,
                'category' => 'Indoor',
                'light' => 'Indirect Light',
                'water' => 'Once a week',
                'humidity' => 'Humid',
                'difficulty' => 'Easy',
                'rooms' => json_encode(['Living Room', 'Bedroom']),
                'quantity_categories' => json_encode(['One', '2-3']),
                'is_active' => true,
            ],
            [
                'name' => 'Snake Plant',
                'scientific_name' => 'Sansevieria trifasciata',
                'description' => 'Hardy indoor plant with tall, upright leaves.',
                'price' => 24.99,
                'stock' => 75,
                'category' => 'Indoor',
                'light' => 'Low Light',
                'water' => 'Every 2 weeks',
                'humidity' => 'Normal',
                'difficulty' => 'Easy',
                'rooms' => json_encode(['Bedroom', 'Office', 'Bathroom']),
                'quantity_categories' => json_encode(['One', '2-3', '4-5']),
                'is_active' => true,
            ],
            [
                'name' => 'Peace Lily',
                'scientific_name' => 'Spathiphyllum',
                'description' => 'Elegant plant with white flowers, great for air purification.',
                'price' => 19.99,
                'stock' => 40,
                'category' => 'Indoor',
                'light' => 'Low Light',
                'water' => 'Once a week',
                'humidity' => 'Humid',
                'difficulty' => 'Easy',
                'rooms' => json_encode(['Living Room', 'Office']),
                'quantity_categories' => json_encode(['One', '2-3']),
                'is_active' => true,
            ],
            [
                'name' => 'Fiddle Leaf Fig',
                'scientific_name' => 'Ficus lyrata',
                'description' => 'Trendy plant with large, violin-shaped leaves.',
                'price' => 49.99,
                'stock' => 25,
                'category' => 'Indoor',
                'light' => 'Bright Light',
                'water' => 'Once a week',
                'humidity' => 'Normal',
                'difficulty' => 'Medium',
                'rooms' => json_encode(['Living Room']),
                'quantity_categories' => json_encode(['One']),
                'is_active' => true,
            ],
            [
                'name' => 'Pothos',
                'scientific_name' => 'Epipremnum aureum',
                'description' => 'Trailing vine plant, perfect for beginners.',
                'price' => 15.99,
                'stock' => 100,
                'category' => 'Indoor',
                'light' => 'Medium Light',
                'water' => 'Once a week',
                'humidity' => 'Normal',
                'difficulty' => 'Easy',
                'rooms' => json_encode(['Living Room', 'Bedroom', 'Office']),
                'quantity_categories' => json_encode(['One', '2-3', '4-5', 'More than 5']),
                'is_active' => true,
            ],
            [
                'name' => 'Rubber Plant',
                'scientific_name' => 'Ficus elastica',
                'description' => 'Attractive plant with glossy, dark leaves.',
                'price' => 34.99,
                'stock' => 30,
                'category' => 'Indoor',
                'light' => 'Bright Light',
                'water' => '2-3 times a week',
                'humidity' => 'Normal',
                'difficulty' => 'Medium',
                'rooms' => json_encode(['Living Room']),
                'quantity_categories' => json_encode(['One']),
                'is_active' => true,
            ],
            [
                'name' => 'ZZ Plant',
                'scientific_name' => 'Zamioculcas zamiifolia',
                'description' => 'Nearly indestructible plant with waxy leaves.',
                'price' => 27.99,
                'stock' => 60,
                'category' => 'Indoor',
                'light' => 'Low Light',
                'water' => 'Every 2 weeks',
                'humidity' => 'Dry',
                'difficulty' => 'Easy',
                'rooms' => json_encode(['Office', 'Bathroom']),
                'quantity_categories' => json_encode(['One', '2-3']),
                'is_active' => true,
            ],
            [
                'name' => 'Spider Plant',
                'scientific_name' => 'Chlorophytum comosum',
                'description' => 'Easy-care plant that produces baby plants.',
                'price' => 12.99,
                'stock' => 80,
                'category' => 'Indoor',
                'light' => 'Bright Light',
                'water' => 'Once a week',
                'humidity' => 'Normal',
                'difficulty' => 'Easy',
                'rooms' => json_encode(['Bedroom', 'Living Room', 'Kitchen']),
                'quantity_categories' => json_encode(['2-3', '4-5', 'More than 5']),
                'is_active' => true,
            ],
        ];

        foreach ($plants as $plant) {
            Plant::create($plant);
        }

        $this->command->info('Created ' . count($plants) . ' plants!');
    }
}
