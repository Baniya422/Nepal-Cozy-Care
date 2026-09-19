<?php

namespace Tests\Feature;

use App\Models\Plant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlantControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_all_active_plants()
    {
        Plant::create([
            'name' => 'Aloe Vera',
            'scientific_name' => 'Aloe barbadensis',
            'category' => 'Succulents',
            'is_active' => true,
            'price' => 15.99,
            'stock' => 10,
        ]);
        Plant::create([
            'name' => 'Snake Plant',
            'scientific_name' => 'Sansevieria trifasciata',
            'category' => 'Succulents',
            'is_active' => false,
            'price' => 20.00,
            'stock' => 10,
        ]);
        $response = $this->getJson('/api/plants');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.plants')
            ->assertJsonPath('data.plants.0.name', 'Aloe Vera');
    }

    public function test_listing_view_returns_cacheable_lightweight_catalog_data()
    {
        Plant::create([
            'name' => 'Fast Catalog Plant',
            'category' => 'Indoor',
            'description' => str_repeat('Long care description. ', 100),
            'is_active' => true,
            'price' => 450,
            'stock' => 4,
        ]);

        $response = $this->getJson('/api/plants?view=listing&per_page=100');

        $response->assertOk()
            ->assertHeader('Cache-Control', 'max-age=60, public, stale-while-revalidate=300')
            ->assertJsonPath('data.plants.0.name', 'Fast Catalog Plant')
            ->assertJsonPath('data.plants.0.avg_rating', 0)
            ->assertJsonPath('data.plants.0.review_count', 0)
            ->assertJsonMissingPath('data.plants.0.description');
    }

    public function test_can_get_popular_plants()
    {
        Plant::create([
            'name' => 'Popular Plant',
            'scientific_name' => 'Popularia',
            'category' => 'Indoor',
            'is_active' => true,
            'views' => 100,
            'price' => 25.0,
            'stock' => 5,
        ]);
        Plant::create([
            'name' => 'Unpopular Plant',
            'scientific_name' => 'Unpopularia',
            'category' => 'Indoor',
            'is_active' => true,
            'views' => 5,
            'price' => 25.0,
            'stock' => 5,
        ]);
        $response = $this->getJson('/api/popular-items');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.data')
            ->assertJsonPath('data.data.0.name', 'Popular Plant')
            ->assertJsonPath('data.data.1.name', 'Unpopular Plant');
    }

    public function test_can_show_single_plant()
    {
        $plant = Plant::create([
            'name' => 'Ficus',
            'scientific_name' => 'Ficus benjamina',
            'category' => 'Indoor',
            'is_active' => true,
            'views' => 0,
            'price' => 30.0,
            'stock' => 2,
        ]);
        $response = $this->getJson('/api/plants/'.$plant->id);
        $response->assertStatus(200)
            ->assertJsonPath('data.plant.name', 'Ficus');
        $this->assertEquals(1, $plant->fresh()->views);
    }

    public function test_can_search_plants()
    {
        Plant::create([
            'name' => 'Searchable Aloe',
            'scientific_name' => 'Aloe test',
            'category' => 'Succulents',
            'is_active' => true,
            'price' => 10,
            'stock' => 10,
        ]);
        Plant::create([
            'name' => 'Other Plant',
            'scientific_name' => 'Other test',
            'category' => 'Indoor',
            'is_active' => true,
            'price' => 10,
            'stock' => 10,
        ]);
        $response = $this->getJson('/api/plants?search=Aloe');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.plants')
            ->assertJsonPath('data.plants.0.name', 'Searchable Aloe');
    }

    public function test_can_filter_plants_by_category()
    {
        Plant::create([
            'name' => 'Indoor Plant',
            'category' => 'Indoor',
            'is_active' => true,
            'price' => 10,
            'stock' => 10,
        ]);
        Plant::create([
            'name' => 'Outdoor Plant',
            'category' => 'Outdoor',
            'is_active' => true,
            'price' => 10,
            'stock' => 10,
        ]);
        $response = $this->getJson('/api/plants?category=Indoor');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.plants')
            ->assertJsonPath('data.plants.0.name', 'Indoor Plant');
    }
}
