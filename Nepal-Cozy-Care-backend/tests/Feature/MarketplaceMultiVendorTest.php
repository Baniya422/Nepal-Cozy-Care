<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plant;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MarketplaceMultiVendorTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;
    private User $customer;
    private User $sellerUser;
    private Shop $sellerShop;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        $this->customer = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
        ]);

        $this->sellerUser = User::factory()->create([
            'role' => User::ROLE_SELLER,
        ]);

        $this->sellerShop = Shop::create([
            'user_id' => $this->sellerUser->id,
            'name' => 'Himalayan Flora Farm',
            'slug' => 'himalayan-flora-farm',
            'short_description' => 'Organic plants from the valley',
            'description' => 'We cultivate healthy plants and herbs.',
            'establishment_year' => 2018,
            'email' => 'contact@himalayanflora.com',
            'phone' => '9800000001',
            'address' => 'Patan Dhoka',
            'city' => 'Lalitpur',
            'status' => Shop::STATUS_APPROVED,
            'is_verified' => true,
            'approved_at' => now(),
            'approved_by' => $this->superAdmin->id,
        ]);

        Shop::firstOrCreate([
            'slug' => 'nepal-cozy-care',
        ], [
            'user_id' => $this->superAdmin->id,
            'name' => 'Nepal Cozy Care',
            'email' => 'care@nepalcozycare.com',
            'phone' => '9800000000',
            'address' => 'Kathmandu',
            'city' => 'Kathmandu',
            'status' => Shop::STATUS_APPROVED,
            'is_verified' => true,
        ]);
    }

    public function test_customer_can_apply_to_become_a_seller()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/seller/apply', [
                'name' => 'Pokhara Green House',
                'short_description' => 'Lakeside succulents & pots',
                'description' => 'Premium nursery in Pokhara.',
                'establishment_year' => 2020,
                'email' => 'pokhara@greenhouse.com',
                'phone' => '9841234567',
                'address' => 'Lakeside Ward 6',
                'city' => 'Pokhara',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('shops', [
            'name' => 'Pokhara Green House',
            'slug' => 'pokhara-green-house',
            'status' => Shop::STATUS_PENDING,
            'user_id' => $this->customer->id,
        ]);
    }

    public function test_super_admin_can_approve_seller_application_and_grant_role()
    {
        $applicant = User::factory()->create(['role' => User::ROLE_CUSTOMER]);
        $shop = Shop::create([
            'user_id' => $applicant->id,
            'name' => 'Bhaktapur Bonsai',
            'slug' => 'bhaktapur-bonsai',
            'email' => 'bonsai@bhaktapur.com',
            'phone' => '9811111111',
            'address' => 'Durbar Square',
            'city' => 'Bhaktapur',
            'status' => Shop::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/admin/shops/{$shop->id}/approve");

        $response->assertStatus(200);
        $this->assertEquals(Shop::STATUS_APPROVED, $shop->fresh()->status);
        $this->assertEquals(User::ROLE_SELLER, $applicant->fresh()->role);
    }

    public function test_super_admin_can_reject_seller_application_with_reason()
    {
        $applicant = User::factory()->create(['role' => User::ROLE_CUSTOMER]);
        $shop = Shop::create([
            'user_id' => $applicant->id,
            'name' => 'Spam Nursery',
            'slug' => 'spam-nursery',
            'email' => 'spam@example.com',
            'phone' => '9800000000',
            'address' => 'Nowhere',
            'city' => 'Unknown',
            'status' => Shop::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/admin/shops/{$shop->id}/reject", [
                'reason' => 'Incomplete business credentials provided.',
            ]);

        $response->assertStatus(200);
        $this->assertEquals(Shop::STATUS_REJECTED, $shop->fresh()->status);
        $this->assertEquals('Incomplete business credentials provided.', $shop->fresh()->rejection_reason);
    }

    public function test_seller_cannot_access_super_admin_endpoints()
    {
        $response = $this->actingAs($this->sellerUser, 'sanctum')
            ->getJson('/api/admin/shops');

        $response->assertStatus(403);
    }

    public function test_customer_cannot_access_seller_portal()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/seller/dashboard/stats');

        $response->assertStatus(403);
    }

    public function test_seller_can_create_product_which_defaults_to_pending_approval()
    {
        $response = $this->actingAs($this->sellerUser, 'sanctum')
            ->postJson('/api/seller/products', [
                'name' => 'Mountain Fern',
                'scientific_name' => 'Adiantum pedatum',
                'category' => 'Ferns',
                'description' => 'Beautiful native fern from Annapurna region.',
                'price' => 750,
                'stock' => 15,
                'difficulty' => 'intermediate',
                'submit_for_review' => true,
            ]);

        $response->assertStatus(201);
        $plantId = $response->json('data.plant.id');

        $plant = Plant::findOrFail($plantId);
        $this->assertEquals($this->sellerShop->id, $plant->shop_id);
        $this->assertEquals(Plant::STATUS_PENDING, $plant->approval_status);
        $this->assertFalse((bool) $plant->is_active);
    }

    public function test_seller_can_create_product_with_an_optimized_image()
    {
        Storage::fake('public');

        $response = $this->actingAs($this->sellerUser, 'sanctum')
            ->post('/api/seller/products', [
                'name' => 'Quick Upload Fern',
                'category' => 'Ferns',
                'description' => 'A healthy fern uploaded by a marketplace vendor.',
                'price' => 650,
                'stock' => 8,
                'submit_for_review' => true,
                'image' => UploadedFile::fake()->image('fern-photo.jpg', 1800, 1400),
            ], ['Accept' => 'application/json']);

        $response->assertCreated();
        $imagePath = $response->json('data.plant.image');

        $this->assertNotEmpty($imagePath);
        Storage::disk('public')->assertExists($imagePath);
        $this->assertStringStartsWith('plants/', $imagePath);
    }

    public function test_super_admin_can_approve_marketplace_product()
    {
        $plant = Plant::create([
            'shop_id' => $this->sellerShop->id,
            'name' => 'Orchid Queen',
            'category' => 'Flowering',
            'description' => 'Exotic indoor orchid.',
            'price' => 1200,
            'stock' => 5,
            'approval_status' => Plant::STATUS_PENDING,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/admin/marketplace/products/{$plant->id}/approve");

        $response->assertStatus(200);
        $this->assertEquals(Plant::STATUS_APPROVED, $plant->fresh()->approval_status);
        $this->assertTrue((bool) $plant->fresh()->is_active);
    }

    public function test_suspended_shop_and_products_do_not_appear_publicly()
    {
        $plant = Plant::create([
            'shop_id' => $this->sellerShop->id,
            'name' => 'Golden Bamboo',
            'category' => 'Bamboo',
            'description' => 'Ornamental bamboo.',
            'price' => 500,
            'stock' => 10,
            'approval_status' => Plant::STATUS_APPROVED,
            'is_active' => true,
        ]);

        // Public plants list contains it when shop is approved
        $resBefore = $this->getJson('/api/plants');
        $this->assertTrue(collect($resBefore->json('data.plants'))->contains('id', $plant->id));

        // Suspend shop
        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/admin/shops/{$this->sellerShop->id}/suspend")
            ->assertStatus(200);

        // Shop directory should no longer list the suspended shop
        $shopDir = $this->getJson('/api/shops');
        $this->assertFalse(collect($shopDir->json('data.shops'))->contains('id', $this->sellerShop->id));

        // Public plants list should no longer show the suspended shop's plants
        $resAfter = $this->getJson('/api/plants');
        $this->assertFalse(collect($resAfter->json('data.plants'))->contains('id', $plant->id));
    }

    public function test_seller_cannot_modify_another_sellers_product()
    {
        $otherSeller = User::factory()->create(['role' => User::ROLE_SELLER]);
        $otherShop = Shop::create([
            'user_id' => $otherSeller->id,
            'name' => 'Other Shop',
            'slug' => 'other-shop',
            'email' => 'other@shop.com',
            'phone' => '9800000002',
            'address' => 'Kathmandu',
            'city' => 'Kathmandu',
            'status' => Shop::STATUS_APPROVED,
        ]);

        $plant = Plant::create([
            'shop_id' => $otherShop->id,
            'name' => 'Other Secret Plant',
            'category' => 'Rare',
            'description' => 'Rare species.',
            'price' => 9999,
            'stock' => 1,
            'approval_status' => Plant::STATUS_APPROVED,
            'is_active' => true,
        ]);

        // Seller 1 tries to update Seller 2's plant
        $response = $this->actingAs($this->sellerUser, 'sanctum')
            ->putJson("/api/seller/products/{$plant->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(404);
        $this->assertEquals('Other Secret Plant', $plant->fresh()->name);
    }

    public function test_multi_vendor_checkout_snapshots_shop_and_isolates_orders()
    {
        // Create 2 products from different shops
        $defaultShop = Shop::where('slug', 'nepal-cozy-care')->first();
        $p1 = Plant::create([
            'shop_id' => $defaultShop->id,
            'name' => 'Monstera Deliciosa',
            'category' => 'Indoor',
            'description' => 'Classic Swiss cheese plant.',
            'price' => 1500,
            'stock' => 10,
            'approval_status' => Plant::STATUS_APPROVED,
            'is_active' => true,
        ]);

        $p2 = Plant::create([
            'shop_id' => $this->sellerShop->id,
            'name' => 'Himalayan Orchid',
            'category' => 'Flowering',
            'description' => 'Wild mountain orchid.',
            'price' => 2000,
            'stock' => 5,
            'approval_status' => Plant::STATUS_APPROVED,
            'is_active' => true,
        ]);

        // Customer adds both to cart
        Cart::create(['user_id' => $this->customer->id, 'plant_id' => $p1->id, 'quantity' => 1]);
        Cart::create(['user_id' => $this->customer->id, 'plant_id' => $p2->id, 'quantity' => 2]);

        $checkoutResponse = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/checkout', [
                'shipping_name' => 'Aayush Baniya',
                'shipping_phone' => '9841000000',
                'shipping_city' => 'Kathmandu',
                'shipping_address' => 'Baneshwor',
                'preferred_contact_method' => 'phone',
                'payment_method' => 'cod',
            ]);

        $checkoutResponse->assertStatus(201);
        $orderId = $checkoutResponse->json('data.order.id');

        // Verify order items saved correct shop snapshot
        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'plant_id' => $p1->id,
            'shop_id' => $defaultShop->id,
            'product_name' => 'Monstera Deliciosa',
            'shop_name' => $defaultShop->name,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'plant_id' => $p2->id,
            'shop_id' => $this->sellerShop->id,
            'product_name' => 'Himalayan Orchid',
            'shop_name' => $this->sellerShop->name,
        ]);

        // Seller 2 checks their orders - must see ONLY Himalayan Orchid (their product), NOT Monstera Deliciosa
        $sellerOrderResponse = $this->actingAs($this->sellerUser, 'sanctum')
            ->getJson('/api/seller/orders');

        $sellerOrderResponse->assertStatus(200);
        $items = collect($sellerOrderResponse->json('data.order_items'));
        $this->assertTrue($items->contains('product_name', 'Himalayan Orchid'));
        $this->assertFalse($items->contains('product_name', 'Monstera Deliciosa'));
    }

    public function test_super_admin_can_directly_create_and_assign_vendor_shop_to_user(): void
    {
        $newCustomer = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/shops', [
                'user_id' => $newCustomer->id,
                'name' => 'Kathmandu Valley Bonsai',
                'city' => 'Bhaktapur',
                'address' => 'Suryabinayak',
                'phone' => '9841234567',
                'short_description' => 'Authentic miniature bonsai trees',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('shops', [
            'user_id' => $newCustomer->id,
            'name' => 'Kathmandu Valley Bonsai',
            'city' => 'Bhaktapur',
            'status' => Shop::STATUS_APPROVED,
            'is_verified' => true,
        ]);

        // User role should now be seller
        $this->assertEquals(User::ROLE_SELLER, $newCustomer->fresh()->role);
    }

    public function test_super_admin_can_update_user_role_to_vendor_and_auto_create_shop(): void
    {
        $customer = User::factory()->create([
            'name' => 'Bishal Thapa',
            'role' => User::ROLE_CUSTOMER,
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/admin/users/{$customer->id}/role", [
                'role' => 'seller',
                'shop_name' => 'Bishal Green House',
                'city' => 'Pokhara',
            ]);

        $response->assertStatus(200);
        $this->assertEquals(User::ROLE_SELLER, $customer->fresh()->role);
        $this->assertDatabaseHas('shops', [
            'user_id' => $customer->id,
            'name' => 'Bishal Green House',
            'city' => 'Pokhara',
            'status' => Shop::STATUS_APPROVED,
        ]);
    }
}
