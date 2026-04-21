<?php

namespace Tests\Feature;

use App\Models\Plant;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WishlistControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_plant_to_wishlist()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Rose',
            'category' => 'Outdoor',
            'price' => 20,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/wishlist', [
            'plant_id' => $plant->id
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Added to wishlist');

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'plant_id' => $plant->id
        ]);
    }

    public function test_prevent_duplicate_wishlist_entries()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Tulip',
            'category' => 'Outdoor',
            'price' => 15,
            'stock' => 10,
            'is_active' => true,
        ]);

        // Add first time
        $this->postJson('/api/wishlist', ['plant_id' => $plant->id]);
        
        // Add second time
        $response = $this->postJson('/api/wishlist', ['plant_id' => $plant->id]);

        $response->assertStatus(201); // firstOrCreate returns 201 Usually if new, but should handle gracefully
        $this->assertDatabaseCount('wishlists', 1);
    }

    public function test_user_can_remove_from_wishlist()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Lily',
            'category' => 'Outdoor',
            'price' => 25,
            'stock' => 5,
            'is_active' => true,
        ]);

        Wishlist::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id
        ]);

        $response = $this->deleteJson("/api/wishlist/{$plant->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Removed from wishlist');

        $this->assertDatabaseCount('wishlists', 0);
    }
}
