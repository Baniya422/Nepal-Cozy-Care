<?php

namespace Tests\Feature;

use App\Models\Plant;
use App\Models\User;
use App\Models\Cart;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_item_to_cart()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Fiddle Leaf Fig',
            'scientific_name' => 'Ficus lyrata',
            'category' => 'Outdoor',
            'is_active' => true,
            'price' => 50.00,
            'stock' => 5,
        ]);

        $response = $this->postJson('/api/cart', [
            'plant_id' => $plant->id,
            'quantity' => 2
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.cart.quantity', 2);

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'quantity' => 2
        ]);
    }

    public function test_it_rejects_quantity_above_stock()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Limited Plant',
            'scientific_name' => 'Limitus',
            'category' => 'Outdoor',
            'is_active' => true,
            'price' => 10,
            'stock' => 1,
        ]);

        $response = $this->postJson('/api/cart', [
            'plant_id' => $plant->id,
            'quantity' => 5
        ]);

        $response->assertStatus(400)
                 ->assertJsonPath('message', 'Not enough stock');
    }

    public function test_user_can_clear_cart()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Plant',
            'category' => 'Outdoor',
            'price' => 10,
            'stock' => 10,
        ]);

        Cart::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'quantity' => 1
        ]);

        $response = $this->deleteJson('/api/cart');

        $response->assertStatus(200);
        $this->assertDatabaseCount('carts', 0);
    }

    public function test_user_can_view_cart()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Cart Plant',
            'category' => 'Outdoor',
            'price' => 20,
            'stock' => 10,
        ]);

        Cart::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'quantity' => 2
        ]);

        $response = $this->getJson('/api/cart');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data.cart');
        
        $this->assertEquals(40, $response->json('data.total'));
    }

    public function test_user_can_update_cart_quantity()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Update Plant',
            'category' => 'Outdoor',
            'price' => 10,
            'stock' => 10,
        ]);

        $cartItem = Cart::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'quantity' => 1
        ]);

        $response = $this->putJson("/api/cart/{$cartItem->id}", [
            'quantity' => 3
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.cart.quantity', 3);

        $this->assertEquals(3, $cartItem->fresh()->quantity);
    }

    public function test_user_can_remove_item_from_cart()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Delete Plant',
            'category' => 'Outdoor',
            'price' => 10,
            'stock' => 10,
        ]);

        $cartItem = Cart::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'quantity' => 1
        ]);

        $response = $this->deleteJson("/api/cart/{$cartItem->id}");

        $response->assertStatus(200);
        $this->assertDatabaseCount('carts', 0);
    }
}
