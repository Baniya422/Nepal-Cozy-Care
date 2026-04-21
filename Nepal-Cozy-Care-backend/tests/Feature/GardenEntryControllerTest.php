<?php

namespace Tests\Feature;

use App\Models\Plant;
use App\Models\User;
use App\Models\GardenEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Carbon;

class GardenEntryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_plant_to_garden()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Jade Plant',
            'category' => 'Succulents',
            'price' => 12,
            'stock' => 20,
        ]);

        $response = $this->postJson('/api/my-garden', [
            'plant_id' => $plant->id,
            'nickname' => 'My Lucky Jade',
            'watering_frequency_days' => 10
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('garden_entries', [
            'user_id' => $user->id,
            'nickname' => 'My Lucky Jade'
        ]);
    }

    public function test_user_can_mark_plant_as_watered()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create(['name' => 'Pothos', 'category' => 'Indoor', 'price' => 10, 'stock' => 10]);
        
        $entry = GardenEntry::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'nickname' => 'Pothos',
            'watering_frequency_days' => 7,
            'last_watered_at' => now()->subDays(10) // overdue
        ]);

        $response = $this->postJson("/api/my-garden/{$entry->id}/water");

        $response->assertStatus(200);
        
        // Use fresh() and carbon to compare ignoring seconds if needed or just checking it updated
        $this->assertTrue(Carbon::parse($entry->fresh()->last_watered_at)->isToday());
    }

    public function test_garden_summary_calculation()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create(['name' => 'Plant', 'category' => 'Indoor', 'price' => 10, 'stock' => 10]);

        // Overdue plant
        GardenEntry::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'watering_frequency_days' => 5,
            'last_watered_at' => now()->subDays(10)
        ]);

        // Healthy plant
        GardenEntry::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'watering_frequency_days' => 5,
            'last_watered_at' => now()->subDays(1)
        ]);

        $response = $this->getJson('/api/my-garden');

        $response->assertStatus(200)
                 ->assertJsonPath('data.summary.needs_watering', 1)
                 ->assertJsonPath('data.summary.total_entries', 2);
    }
}
