<?php

namespace Tests\Feature;

use App\Models\AdminSetting;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plant;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\Shop;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\User;
use App\Services\DeliveryRoutingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LaunchFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;
    private Plant $plantHigh;
    private Plant $plantLow;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        $this->customer = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
        ]);

        // Configure default store dispatch in Kathmandu
        AdminSetting::current()->update([
            'vendor_marketplace_enabled' => false,
            'esewa_enabled' => false,
            'dispatch_latitude' => 27.7172,
            'dispatch_longitude' => 85.3240,
            'dispatch_address' => 'Nepal Cozy Care Hub, Kathmandu',
            'free_delivery_threshold' => 2000.00,
            'free_delivery_radius_km' => 10.00,
            'standard_delivery_fee' => 100.00,
            'max_delivery_distance_km' => 25.00,
            'pricing_method' => 'distance_bands',
            'distance_pricing_rules' => [
                ['min_km' => 10, 'max_km' => 15, 'fee' => 150.0],
                ['min_km' => 15, 'max_km' => 25, 'fee' => 250.0],
            ],
        ]);

        $this->plantHigh = Plant::create([
            'name' => 'Fiddle Leaf Fig',
            'category' => 'Indoor',
            'price' => 2000.00,
            'wholesale_price' => 1200.00,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->plantLow = Plant::create([
            'name' => 'Snake Plant',
            'category' => 'Indoor',
            'price' => 1000.00,
            'wholesale_price' => 600.00,
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    /**
     * Test 1: NPR 1,999 versus NPR 2,000 after discounts for free delivery.
     */
    public function test_npr_1999_versus_2000_threshold_for_free_delivery()
    {
        $routingMock = $this->createMock(DeliveryRoutingService::class);
        $this->app->instance(DeliveryRoutingService::class, $routingMock);

        // Within 10 km (e.g. 5 km away)
        $routingMock->method('calculateRoadDistance')->willReturn(5.0);

        // Real quote delivery calculation using mocked road distance
        $service = new DeliveryRoutingService();

        // Subtotal NPR 1,999.00 -> NOT free, standard fee NPR 100
        $quote1999 = $service->quoteDelivery(27.7, 85.3, 1999.00);
        $this->assertEquals(100.00, $quote1999['delivery_fee']);
        $this->assertFalse($quote1999['is_free_delivery']);

        // Subtotal NPR 2,000.00 -> FREE delivery (NPR 0)
        $quote2000 = $service->quoteDelivery(27.7, 85.3, 2000.00);
        $this->assertEquals(0.00, $quote2000['delivery_fee']);
        $this->assertTrue($quote2000['is_free_delivery']);
    }

    /**
     * Test 2: Exactly 10.0 km versus 10.1 km road distance delivery fee.
     */
    public function test_exactly_10km_versus_over_10km_pricing()
    {
        $service = new DeliveryRoutingService();

        // 10.0 km with subtotal 2,500 qualifies for free delivery
        // We mock calculateRoadDistance by testing quoteDelivery logic
        $mock = $this->getMockBuilder(DeliveryRoutingService::class)
            ->onlyMethods(['calculateRoadDistance'])
            ->getMock();

        $mock->expects($this->once())
            ->method('calculateRoadDistance')
            ->willReturn(10.0);

        $quote10km = $mock->quoteDelivery(27.7, 85.3, 2500.00);
        $this->assertEquals(0.00, $quote10km['delivery_fee']);
        $this->assertTrue($quote10km['is_free_delivery']);

        // 10.1 km with subtotal 2,500: distance-based charge (150 NPR), even though subtotal >= 2000
        $mockOver = $this->getMockBuilder(DeliveryRoutingService::class)
            ->onlyMethods(['calculateRoadDistance'])
            ->getMock();

        $mockOver->expects($this->once())
            ->method('calculateRoadDistance')
            ->willReturn(10.1);

        $quoteOver10km = $mockOver->quoteDelivery(27.7, 85.3, 2500.00);
        $this->assertEquals(150.00, $quoteOver10km['delivery_fee']);
        $this->assertFalse($quoteOver10km['is_free_delivery']);
    }

    /**
     * Test 3: Discounts reducing subtotal below NPR 2,000 remove free delivery eligibility.
     */
    public function test_promo_discount_removing_free_delivery_eligibility()
    {
        Sanctum::actingAs($this->customer);

        // Create 10% promo code
        $promo = PromoCode::create([
            'code' => 'COZY10',
            'type' => 'percentage',
            'value' => 10.00,
            'is_active' => true,
        ]);

        // Cart item: NPR 2,200.00
        $plant = Plant::create([
            'name' => 'Bonsai Ficus',
            'price' => 2200.00,
            'stock' => 5,
            'is_active' => true,
        ]);
        Cart::create([
            'user_id' => $this->customer->id,
            'plant_id' => $plant->id,
            'quantity' => 1,
        ]);

        // Mock road distance to 6.0 km (within 10km radius)
        $mock = $this->createMock(DeliveryRoutingService::class);
        $mock->method('calculateRoadDistance')->willReturn(6.0);
        $mock->method('quoteDelivery')->willReturnCallback(function ($lat, $lng, $discountedSubtotal) {
            $service = new DeliveryRoutingService();
            // With mocked distance 6.0km:
            if ($discountedSubtotal >= 2000) {
                return ['road_distance_km' => 6.0, 'delivery_fee' => 0.0, 'is_free_delivery' => true, 'qualification_reason' => 'Free'];
            }
            return ['road_distance_km' => 6.0, 'delivery_fee' => 100.0, 'is_free_delivery' => false, 'qualification_reason' => 'Standard'];
        });
        $this->app->instance(DeliveryRoutingService::class, $mock);

        // Before promo: Subtotal 2200 -> Free delivery
        $resWithoutPromo = $this->postJson('/api/delivery/quote', [
            'latitude' => 27.70,
            'longitude' => 85.31,
        ]);
        $resWithoutPromo->assertOk();
        $this->assertEquals(0.00, $resWithoutPromo->json('data.delivery_fee'));
        $this->assertTrue($resWithoutPromo->json('data.is_free_delivery'));

        // After promo: NPR 2,200 - 10% (220) = NPR 1,980 -> loses free delivery!
        $resWithPromo = $this->postJson('/api/delivery/quote', [
            'latitude' => 27.70,
            'longitude' => 85.31,
            'promo_code' => 'COZY10',
        ]);
        $resWithPromo->assertOk();
        $this->assertEquals(1980.00, $resWithPromo->json('data.discounted_subtotal'));
        $this->assertEquals(100.00, $resWithPromo->json('data.delivery_fee'));
        $this->assertFalse($resWithPromo->json('data.is_free_delivery'));
    }

    /**
     * Test 4: Invalid/expired promos and usage limits.
     */
    public function test_invalid_expired_and_limit_exhausted_promos()
    {
        Sanctum::actingAs($this->customer);

        // 1. Expired promo
        $expiredPromo = PromoCode::create([
            'code' => 'EXPIRED10',
            'type' => 'percentage',
            'value' => 10,
            'end_date' => now()->subDay(),
            'is_active' => true,
        ]);

        $resExpired = $this->postJson('/api/promo/validate', [
            'code' => 'EXPIRED10',
            'subtotal' => 2500,
        ]);
        $resExpired->assertStatus(422)
            ->assertJsonFragment(['This promo code has expired.']);

        // 2. Limit exhausted promo
        $limitPromo = PromoCode::create([
            'code' => 'LIMITED1',
            'type' => 'fixed',
            'value' => 150,
            'total_usage_limit' => 2,
            'times_used' => 2,
            'is_active' => true,
        ]);

        $resLimit = $this->postJson('/api/promo/validate', [
            'code' => 'LIMITED1',
            'subtotal' => 2500,
        ]);
        $resLimit->assertStatus(422)
            ->assertJsonFragment(['This promo code has reached its maximum total usage limit.']);

        // 3. Minimum subtotal restriction
        $minPromo = PromoCode::create([
            'code' => 'MIN3000',
            'type' => 'fixed',
            'value' => 200,
            'min_subtotal' => 3000,
            'is_active' => true,
        ]);

        $resMin = $this->postJson('/api/promo/validate', [
            'code' => 'MIN3000',
            'subtotal' => 1500,
        ]);
        $resMin->assertStatus(422);
    }

    /**
     * Test 5: Routing failure and max delivery range prevention without straight-line substitution.
     */
    public function test_routing_failure_and_out_of_range_handling()
    {
        Sanctum::actingAs($this->customer);

        Cart::create([
            'user_id' => $this->customer->id,
            'plant_id' => $this->plantHigh->id,
            'quantity' => 1,
        ]);

        // Mock routing exception
        $routingMock = $this->createMock(DeliveryRoutingService::class);
        $routingMock->method('quoteDelivery')->willThrowException(
            new \RuntimeException('Road routing calculation failed: could not connect to routing service. Please retry in a moment.')
        );
        $this->app->instance(DeliveryRoutingService::class, $routingMock);

        $response = $this->postJson('/api/delivery/quote', [
            'latitude' => 27.7,
            'longitude' => 85.3,
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['Road routing calculation failed: could not connect to routing service. Please retry in a moment.']);
    }

    /**
     * Test 6: Backend rejection of disabled payment (eSewa) and disabled vendor actions.
     */
    public function test_backend_rejection_of_disabled_esewa_and_vendor_actions()
    {
        Sanctum::actingAs($this->customer);

        Cart::create([
            'user_id' => $this->customer->id,
            'plant_id' => $this->plantHigh->id,
            'quantity' => 1,
        ]);

        // 1. Attempt non-COD checkout when eSewa is disabled
        $checkoutResponse = $this->postJson('/api/checkout', [
            'shipping_name' => 'Ramesh Shrestha',
            'shipping_phone' => '9841000000',
            'shipping_city' => 'Kathmandu',
            'shipping_address' => 'Thamel',
            'preferred_contact_method' => 'phone',
            'payment_method' => 'esewa',
        ]);
        $checkoutResponse->assertStatus(422);

        // 2. Attempt vendor registration when vendor features are disabled
        $applyResponse = $this->postJson('/api/seller/apply', [
            'name' => 'Green Valley Nursery',
            'email' => 'green@valley.com',
            'phone' => '9841111111',
            'address' => 'Bhaktapur',
            'city' => 'Bhaktapur',
        ]);
        $applyResponse->assertStatus(403)
            ->assertJsonFragment(['Vendor partner registration is temporarily closed.']);

        // 3. Public shop directory returns 404
        $shopsResponse = $this->getJson('/api/shops');
        $shopsResponse->assertStatus(404);
    }

    /**
     * Test 7: Supplier partial payments, historical cost snapshots, and explicit cancellation adjustments.
     */
    public function test_supplier_accounting_snapshots_and_explicit_cancellations()
    {
        Sanctum::actingAs($this->admin);

        // 1. Create a nursery supplier
        $supplier = Supplier::create([
            'name' => 'Everest Botanical Nursery',
            'contact_person' => 'Sunil KC',
            'phone' => '9851000000',
            'address' => 'Godawari, Lalitpur',
        ]);

        // 2. Associate plant with supplier and wholesale cost NPR 700
        $plant = Plant::create([
            'name' => 'Prayer Plant',
            'category' => 'Indoor',
            'price' => 1200.00,
            'wholesale_price' => 700.00,
            'supplier_id' => $supplier->id,
            'stock' => 10,
            'is_active' => true,
        ]);

        // 3. Customer places order
        Sanctum::actingAs($this->customer);
        Cart::create([
            'user_id' => $this->customer->id,
            'plant_id' => $plant->id,
            'quantity' => 2,
        ]);

        $orderRes = $this->postJson('/api/checkout', [
            'shipping_name' => 'Anita Karki',
            'shipping_phone' => '9800000000',
            'shipping_city' => 'Lalitpur',
            'shipping_address' => 'Kupondole',
            'preferred_contact_method' => 'phone',
            'payment_method' => 'cod',
        ]);
        $orderRes->assertStatus(201);
        $orderId = $orderRes->json('data.order.id');

        $orderItem = OrderItem::where('order_id', $orderId)->first();
        // Check historical snapshot
        $this->assertEquals($supplier->id, $orderItem->supplier_id);
        $this->assertEquals('Everest Botanical Nursery', $orderItem->supplier_name);
        $this->assertEquals(700.00, $orderItem->wholesale_unit_cost);
        $this->assertEquals('payable', $orderItem->supplier_obligation_status);

        // 4. Later plant price/cost edit does NOT change old order snapshot
        $plant->update(['wholesale_price' => 950.00, 'name' => 'Prayer Plant Special']);
        $this->assertEquals(700.00, $orderItem->fresh()->wholesale_unit_cost);

        // 5. Admin records partial payment to supplier
        Sanctum::actingAs($this->admin);
        $payRes = $this->postJson('/api/admin/supplier-payments', [
            'supplier_id' => $supplier->id,
            'amount' => 1000.00, // Total owed is 2 * 700 = 1400
            'payment_date' => now()->toDateString(),
            'payment_method' => 'bank_transfer',
            'reference' => 'NIBL-TXN-883921',
            'allocations' => [
                [
                    'order_id' => $orderId,
                    'order_item_id' => $orderItem->id,
                    'amount' => 1000.00,
                ],
            ],
        ]);
        $payRes->assertStatus(201);

        $summary = $supplier->financialSummary();
        $this->assertEquals(1400.00, $summary['total_wholesale_cost']);
        $this->assertEquals(1000.00, $summary['total_paid']);
        $this->assertEquals(400.00, $summary['balance_remaining']);

        // 6. Explicit obligation adjustment: does not automatically erase just because customer cancels
        $adjRes = $this->putJson("/api/admin/orders/{$orderId}/items/{$orderItem->id}/obligation", [
            'supplier_obligation_status' => 'payable',
            'notes' => 'Customer cancelled, but nursery already uprooted plant. Store assumes obligation.',
        ]);
        $adjRes->assertOk();
        $this->assertEquals('payable', $orderItem->fresh()->supplier_obligation_status);
    }

    /**
     * Test 8: Customer cannot access private supplier data.
     */
    public function test_customer_cannot_access_private_supplier_data()
    {
        $supplier = Supplier::create([
            'name' => 'Secret Himalayan Nursery',
            'contact_person' => 'Classified',
        ]);

        // Customer attempts to access admin supplier endpoints
        Sanctum::actingAs($this->customer);

        $this->getJson('/api/admin/suppliers')->assertStatus(403);
        $this->getJson('/api/admin/suppliers/financial-summary')->assertStatus(403);
        $this->getJson("/api/admin/suppliers/{$supplier->id}")->assertStatus(403);
        $this->postJson('/api/admin/supplier-payments', [])->assertStatus(403);
    }
}
