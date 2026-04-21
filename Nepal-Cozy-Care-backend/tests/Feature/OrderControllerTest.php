<?php

namespace Tests\Feature;

use App\Models\Plant;
use App\Models\User;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_place_order_from_cart()
    {
        Event::fake();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plant = Plant::create([
            'name' => 'Monstera',
            'category' => 'Indoor',
            'price' => 100,
            'stock' => 5,
        ]);

        Cart::create([
            'user_id' => $user->id,
            'plant_id' => $plant->id,
            'quantity' => 1
        ]);

        $response = $this->postJson('/api/checkout', [
            'shipping_name' => 'John Doe',
            'shipping_phone' => '9876543210',
            'shipping_city' => 'Kathmandu',
            'shipping_address' => 'Baneshwor',
            'payment_method' => 'cod',
            'preferred_contact_method' => 'phone'
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Order placed successfully');

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_name' => 'John Doe',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $this->assertEquals(110, $order->total);

        // Stock should be reduced
        $this->assertEquals(4, $plant->fresh()->stock);
        
        // Cart should be empty
        $this->assertDatabaseCount('carts', 0);
    }

    public function test_it_rejects_non_cod_payment()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/checkout', [
            'shipping_name' => 'John Doe',
            'shipping_phone' => '9812345678',
            'shipping_city' => 'Kathmandu',
            'shipping_address' => 'Baneshwor',
            'preferred_contact_method' => 'phone',
            'payment_method' => 'khalti'
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['Selected payment gateway is coming soon. Please use Cash on Delivery for now.']);
    }

    public function test_user_can_cancel_pending_order()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'subtotal' => 100,
            'tax' => 10,
            'total' => 110,
            'shipping_name' => 'Test',
            'shipping_phone' => '123',
            'shipping_city' => 'City',
            'shipping_address' => 'Addr'
        ]);

        $response = $this->postJson("/api/orders/{$order->id}/cancel");

        $response->assertStatus(200);
        $this->assertEquals('cancelled', $order->fresh()->status);
    }

    public function test_user_can_view_order_history()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'subtotal' => 100,
            'tax' => 10,
            'total' => 110,
            'shipping_name' => 'Test',
            'shipping_phone' => '123',
            'shipping_city' => 'City',
            'shipping_address' => 'Addr'
        ]);

        $response = $this->getJson('/api/orders');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data.orders');
    }

    public function test_user_can_view_single_order_details()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'subtotal' => 100,
            'tax' => 10,
            'total' => 110,
            'shipping_name' => 'Test',
            'shipping_phone' => '123',
            'shipping_city' => 'City',
            'shipping_address' => 'Addr'
        ]);

        $response = $this->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.order.id', $order->id);
    }

    public function test_user_cannot_view_others_order()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        Sanctum::actingAs($user);

        $order = Order::create([
            'user_id' => $otherUser->id,
            'status' => 'pending',
            'subtotal' => 100,
            'tax' => 10,
            'total' => 110,
            'shipping_name' => 'Other',
            'shipping_phone' => '123',
            'shipping_city' => 'City',
            'shipping_address' => 'Addr'
        ]);

        $response = $this->getJson("/api/orders/{$order->id}");

        $response->assertStatus(403);
    }

    public function test_public_can_track_order()
    {
        $user = User::factory()->create(['email' => 'track@example.com']);
        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'subtotal' => 100,
            'tax' => 10,
            'total' => 110,
            'shipping_name' => 'Track',
            'shipping_phone' => '123',
            'shipping_city' => 'City',
            'shipping_address' => 'Addr'
        ]);

        $response = $this->postJson('/api/orders/track', [
            'order_id' => (string) $order->id,
            'email' => 'track@example.com'
        ]);

        $response->assertStatus(200);
        $this->assertEquals($order->id, $response->json('data.order.id'));
        $response->assertJsonStructure(['data' => ['order', 'timeline', 'current_status']]);
    }
}
