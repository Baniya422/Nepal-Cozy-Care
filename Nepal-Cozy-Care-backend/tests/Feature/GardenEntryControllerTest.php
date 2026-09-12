<?php

namespace Tests\Feature;

use App\Models\GardenEntry;
use App\Models\Plant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

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
            'watering_frequency_days' => 10,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('garden_entries', [
            'user_id' => $user->id,
            'nickname' => 'My Lucky Jade',
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
            'last_watered_at' => now()->subDays(10),
        ]);
        $response = $this->postJson("/api/my-garden/{$entry->id}/water");
        $response->assertStatus(200);
        $this->assertTrue(Carbon::parse($entry->fresh()->last_watered_at)->isToday());
    }

    public function test_garden_summary_calculation()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $plant = Plant::create(['name' => 'Plant', 'category' => 'Indoor', 'price' => 10, 'stock' => 10]);
        GardenEntry::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'watering_frequency_days' => 5,
            'last_watered_at' => now()->subDays(10),
        ]);
        GardenEntry::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'watering_frequency_days' => 5,
            'last_watered_at' => now()->subDays(1),
        ]);
        $response = $this->getJson('/api/my-garden');
        $response->assertStatus(200)
            ->assertJsonPath('data.summary.needs_watering', 1)
            ->assertJsonPath('data.summary.total_entries', 2);
    }
}
