<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AuthGoogleTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_auth_creates_new_user_and_returns_token(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'sub' => 'google_user_12345',
                'email' => 'googleuser@gmail.com',
                'name' => 'Google Plant Lover',
                'picture' => 'https://lh3.googleusercontent.com/a/sample-photo',
            ], 200),
        ]);

        $response = $this->postJson('/api/auth/google', [
            'credential' => 'valid_mock_google_id_token',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Google authentication successful')
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'google_id',
                    'avatar',
                    'role',
                ],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'googleuser@gmail.com',
            'name' => 'Google Plant Lover',
            'google_id' => 'google_user_12345',
            'role' => 'customer',
        ]);
    }

    public function test_google_auth_logs_in_existing_user_and_links_google_id(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@gmail.com',
            'google_id' => null,
            'avatar' => null,
        ]);

        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'sub' => 'google_sub_999',
                'email' => 'existing@gmail.com',
                'name' => 'Existing User',
                'picture' => 'https://lh3.googleusercontent.com/photo.jpg',
            ], 200),
        ]);

        $response = $this->postJson('/api/auth/google', [
            'credential' => 'mock_id_token',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'existing@gmail.com');

        $freshUser = $user->fresh();
        $this->assertEquals('google_sub_999', $freshUser->google_id);
        $this->assertEquals('https://lh3.googleusercontent.com/photo.jpg', $freshUser->avatar);
    }

    public function test_google_auth_rejects_invalid_token(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'error' => 'invalid_token',
                'error_description' => 'Invalid Value',
            ], 400),
        ]);

        $response = $this->postJson('/api/auth/google', [
            'credential' => 'invalid_token_sample',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['credential']);
    }
}
