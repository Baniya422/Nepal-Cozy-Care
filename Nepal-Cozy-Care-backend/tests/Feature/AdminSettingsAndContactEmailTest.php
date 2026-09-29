<?php

namespace Tests\Feature;

use App\Mail\ContactMessageReceived;
use App\Mail\OrderPlacedAdmin;
use App\Mail\OrderPlacedCustomer;
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
            ->assertJsonPath('data.email_delivery', 'scheduled');

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
        $this->assertDatabaseHas('orders', [
            'notification_email_error' => null,
        ]);
        $this->assertNotNull(DB::table('orders')->value('notification_email_sent_at'));
        $this->assertNotNull(DB::table('orders')->value('customer_notification_email_sent_at'));
        Mail::assertSent(OrderPlacedCustomer::class, fn ($mail) => $mail->hasTo('buyer@example.com')
            && ! $mail->hasTo('orders@example.com')
            && str_contains($mail->render(), 'Your order'));
        // Running a completed job again must not send duplicate confirmations.
        (new \App\Jobs\SendOrderNotificationEmail(DB::table('orders')->value('id'), true))
            ->handle(app(\App\Services\MailSettingsService::class));
        Mail::assertSent(OrderPlacedCustomer::class, 1);
    }

    public function test_gmail_cannot_be_enabled_without_a_username_and_app_password(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->putJson('/api/admin/settings/mail', [
            'mail_enabled' => true,
            'mail_host' => 'smtp.gmail.com',
            'mail_port' => 587,
            'mail_encryption' => 'tls',
            'mail_from_address' => 'mailer@gmail.com',
            'mail_from_name' => 'Cozy Care',
            'contact_recipient' => 'admin@example.com',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('mail');

        $this->assertFalse(AdminSetting::query()->first()->mail_enabled);
    }
    public function test_gmail_credentials_can_be_changed_and_blank_password_preserves_saved_secret(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $payload = [
            'mail_enabled' => true, 'mail_host' => 'smtp.gmail.com', 'mail_port' => 587,
            'mail_username' => 'sender@gmail.com', 'mail_password' => 'abcd efgh ijkl mnop',
            'mail_encryption' => 'tls', 'mail_from_address' => 'sender@gmail.com',
            'mail_from_name' => 'Cozy Care', 'contact_recipient' => 'admin@example.com',
        ];
        config(['mail.mailers.smtp.url' => 'smtp://obsolete:old@smtp.example.com:2525']);
        $this->putJson('/api/admin/settings/mail', $payload)->assertOk();
        $this->assertSame('abcdefghijklmnop', AdminSetting::first()->mail_password);
        $this->assertNull(config('mail.mailers.smtp.url'));
        $this->assertSame('sender@gmail.com', config('mail.mailers.smtp.username'));
        $payload['mail_password'] = '';
        $payload['contact_recipient'] = 'new-admin@example.com';
        $this->putJson('/api/admin/settings/mail', $payload)->assertOk();
        $this->assertSame('abcdefghijklmnop', AdminSetting::first()->mail_password);
        $this->assertSame('new-admin@example.com', AdminSetting::first()->contact_recipient);
        $payload['mail_password'] = 'new-app-password';
        $this->putJson('/api/admin/settings/mail', $payload)->assertOk();
        $this->assertSame('new-app-password', AdminSetting::first()->mail_password);
    }

    public function test_database_queue_keeps_contact_delivery_out_of_the_web_request(): void
    {
        AdminSetting::first()->update([
            'mail_enabled' => true, 'mail_host' => 'smtp.example.com', 'mail_port' => 587,
            'mail_encryption' => 'tls', 'mail_from_address' => 'sender@example.com',
            'mail_from_name' => 'Cozy Care', 'contact_recipient' => 'admin@example.com',
        ]);
        config(['queue.default' => 'database']);
        Mail::fake();
        $this->postJson('/api/contact', [
            'name' => 'Customer', 'email' => 'customer@example.com', 'phone' => '9800000000',
            'city' => 'Kathmandu', 'subject' => 'plant_care', 'preferred_contact_method' => 'email',
            'message' => 'Please help with my plant.',
        ])->assertCreated();
        Mail::assertNothingSent();
        $this->assertDatabaseCount('jobs', 1);
        $this->artisan('queue:work', ['connection' => 'database', '--once' => true])->assertSuccessful();
        Mail::assertSent(ContactMessageReceived::class);
        $this->assertDatabaseCount('jobs', 0);
    }

    public function test_customer_cannot_change_or_retry_smtp_settings(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->putJson('/api/admin/settings/mail', [])->assertForbidden();
        $this->postJson('/api/admin/settings/mail/retry')->assertForbidden();
    }

    public function test_failed_smtp_job_is_retried_with_the_latest_settings(): void
    {
        AdminSetting::first()->update([
            'mail_enabled' => true, 'mail_host' => 'smtp.example.com', 'mail_port' => 587,
            'mail_encryption' => 'tls', 'mail_from_address' => 'sender@example.com',
            'mail_from_name' => 'Cozy Care', 'contact_recipient' => 'admin@example.com',
        ]);
        config(['queue.default' => 'database']);
        Mail::shouldReceive('purge')->andReturnNull();
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('SMTP unavailable'));
        $this->postJson('/api/contact', [
            'name' => 'Customer', 'email' => 'customer@example.com', 'phone' => '9800000000',
            'city' => 'Kathmandu', 'subject' => 'plant_care', 'preferred_contact_method' => 'email',
            'message' => 'Please help with my plant.',
        ])->assertCreated();
        $this->artisan('queue:work', ['connection' => 'database', '--once' => true])->assertSuccessful();
        $this->assertDatabaseHas('contact_messages', ['email_error' => 'SMTP unavailable', 'email_sent_at' => null]);
        $this->assertDatabaseHas('jobs', ['attempts' => 1]);
        AdminSetting::first()->update(['contact_recipient' => 'new-admin@example.com']);
        DB::table('jobs')->update(['available_at' => time() - 1]);
        // Replace the facade mock with its actual manager before faking delivery.
        Mail::swap(new \Illuminate\Mail\MailManager(app()));
        Mail::fake();
        $this->artisan('queue:work', ['connection' => 'database', '--once' => true])->assertSuccessful();
        Mail::assertSent(ContactMessageReceived::class, fn ($mail) => $mail->hasTo('new-admin@example.com'));
        $this->assertDatabaseCount('jobs', 0);
        $this->assertDatabaseHas('contact_messages', ['email_error' => null]);
    }

    public function test_admin_can_retry_failed_contacts_and_delivered_contacts_are_skipped(): void
    {
        AdminSetting::first()->update([
            'mail_enabled' => true, 'mail_host' => 'smtp.example.com', 'mail_port' => 587,
            'mail_encryption' => 'tls', 'mail_from_address' => 'sender@example.com',
            'mail_from_name' => 'Cozy Care', 'contact_recipient' => 'admin@example.com',
        ]);
        $message = \App\Models\ContactMessage::create([
            'name' => 'Customer', 'email' => 'customer@example.com', 'phone' => '9800000000',
            'city' => 'Kathmandu', 'subject' => 'plant_care', 'preferred_contact_method' => 'email',
            'message' => 'Help', 'status' => 'new', 'email_error' => 'SMTP unavailable',
        ]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        Mail::fake();
        $this->postJson('/api/admin/settings/mail/retry')->assertOk();
        $this->postJson('/api/admin/settings/mail/retry')->assertOk()
            ->assertJsonPath('message', '0 failed email notifications scheduled for retry.');
        Mail::assertSent(ContactMessageReceived::class, 1);
        $this->assertNotNull($message->fresh()->email_sent_at);
    }

    public function test_dashboard_aggregates_match_existing_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $stats = $this->getJson('/api/admin/dashboard/stats')->assertOk()->json('data');
        $this->getJson('/api/admin/dashboard')->assertOk()
            ->assertJsonPath('data.stats', $stats)
            ->assertJsonPath('data.recent_orders', [])
            ->assertJsonPath('data.top_products', []);
    }

    public function test_admin_can_change_login_email_and_password_and_receive_a_new_token(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => 'old-password']);
        Sanctum::actingAs($admin);
        $this->putJson('/api/me', ['name' => 'Updated Admin', 'email' => 'updated@example.com'])
            ->assertOk()->assertJsonPath('user.email', 'updated@example.com');
        $this->putJson('/api/me/password', [
            'current_password' => 'incorrect', 'password' => 'new-password', 'password_confirmation' => 'new-password',
        ])->assertUnprocessable();
        $this->putJson('/api/me/password', [
            'current_password' => 'old-password', 'password' => 'new-password', 'password_confirmation' => 'new-password',
        ])->assertOk()->assertJsonStructure(['token', 'user']);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('new-password', $admin->fresh()->password));
    }

}
