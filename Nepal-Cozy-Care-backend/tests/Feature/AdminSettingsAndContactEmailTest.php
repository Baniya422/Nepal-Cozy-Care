<?php

namespace Tests\Feature;

use App\Mail\ContactMessageReceived;
use App\Mail\OrderPlacedAdmin;
use App\Models\AdminSetting;
use App\Models\Cart;
use App\Models\Plant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSettingsAndContactEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_smtp_settings_without_exposing_password(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->putJson('/api/admin/settings/mail', [
            'mail_enabled' => true,
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_username' => 'mailer@example.com',
            'mail_password' => 'smtp-secret',
            'mail_encryption' => 'tls',
            'mail_from_address' => 'mailer@example.com',
            'mail_from_name' => 'Cozy Care',
            'contact_recipient' => 'admin@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.mail.mail_password_configured', true)
            ->assertJsonMissingPath('data.mail.mail_password');
        $this->assertNotSame(
            'smtp-secret',
            DB::table('admin_settings')->value('mail_password')
        );
    }

    public function test_contact_request_is_stored_and_emailed_to_configured_recipient(): void
    {
        AdminSetting::query()->first()->update([
            'mail_enabled' => true,
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_encryption' => 'tls',
            'mail_from_address' => 'mailer@example.com',
            'mail_from_name' => 'Cozy Care',
            'contact_recipient' => 'admin@example.com',
        ]);
        Mail::fake();

        $this->postJson('/api/contact', [
            'name' => 'Plant Customer',
            'email' => 'customer@example.com',
            'phone' => '9800000000',
            'city' => 'Kathmandu',
            'subject' => 'plant_care',
            'preferred_contact_method' => 'email',
            'order_reference' => null,
            'message' => 'Please help me with yellow leaves.',
        ])->assertCreated()
            ->assertJsonPath('data.email_delivery', 'sent');

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'customer@example.com',
            'email_error' => null,
        ]);
        Mail::assertSent(ContactMessageReceived::class, function (ContactMessageReceived $mail) {
            return $mail->hasTo('admin@example.com')
                && $mail->contactMessage->email === 'customer@example.com';
        });
    }

    public function test_new_order_is_emailed_to_configured_notification_recipient(): void
    {
        AdminSetting::query()->first()->update([
            'mail_enabled' => true,
            'mail_host' => 'smtp.example.com',
            'mail_port' => 587,
            'mail_encryption' => 'tls',
            'mail_from_address' => 'mailer@example.com',
            'mail_from_name' => 'Cozy Care',
            'contact_recipient' => 'orders@example.com',
        ]);
        Mail::fake();

        $customer = User::factory()->create(['email' => 'buyer@example.com']);
        $plant = Plant::create([
            'name' => 'Peace Lily',
            'category' => 'Indoor',
            'price' => 850,
            'stock' => 3,
        ]);
        Cart::create([
            'user_id' => $customer->id,
            'plant_id' => $plant->id,
            'quantity' => 1,
        ]);
        Sanctum::actingAs($customer);

        $this->postJson('/api/checkout', [
            'shipping_name' => 'Plant Buyer',
            'shipping_phone' => '9800000001',
            'shipping_city' => 'Kathmandu',
            'shipping_address' => 'Lazimpat',
            'location_notes' => 'Near the main gate',
            'payment_method' => 'cod',
            'preferred_contact_method' => 'email',
        ])->assertCreated();

        Mail::assertSent(OrderPlacedAdmin::class, function (OrderPlacedAdmin $mail) {
            return $mail->hasTo('orders@example.com')
                && $mail->order->user->email === 'buyer@example.com'
                && $mail->order->items->first()->plant->name === 'Peace Lily'
                && str_contains($mail->render(), 'Peace Lily');
        });
    }
}
