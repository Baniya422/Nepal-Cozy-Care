<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\PasswordResetCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_code_for_existing_user(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset@example.com',
        ]);

        $this->postJson('/api/forgot-password', [
            'email' => 'reset@example.com',
        ])->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset code has been sent.');

        $record = DB::table('password_reset_tokens')
            ->where('email', 'reset@example.com')
            ->first();

        $this->assertNotNull($record);
        $this->assertNotNull($record->token);
        Notification::assertSentTo($user, PasswordResetCodeNotification::class);
    }

    public function test_forgot_password_returns_generic_success_for_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/forgot-password', [
            'email' => 'missing@example.com',
        ])->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset code has been sent.');

        Notification::assertNothingSent();
    }

    public function test_reset_password_updates_password_and_clears_reset_token(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => 'old-password',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        DB::table('password_reset_tokens')->insert([
            'email' => 'reset@example.com',
            'token' => Hash::make('123456'),
            'created_at' => now(),
        ]);

        $this->assertNotEmpty($token);

        $this->postJson('/api/reset-password', [
            'email' => 'reset@example.com',
            'code' => '123456',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk()
            ->assertJsonPath('message', 'Password reset successfully. You can now log in with your new password.');

        $user->refresh();

        $this->assertTrue(Hash::check('new-password', $user->password));
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'reset@example.com',
        ]);
        $this->assertCount(0, $user->tokens);
    }

    public function test_reset_password_rejects_expired_code(): void
    {
        User::factory()->create([
            'email' => 'expired@example.com',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'expired@example.com',
            'token' => Hash::make('999999'),
            'created_at' => now()->subMinutes(11),
        ]);

        $this->postJson('/api/reset-password', [
            'email' => 'expired@example.com',
            'code' => '999999',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }
}
