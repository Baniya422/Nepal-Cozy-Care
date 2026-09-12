<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HomepageContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_load_homepage_content(): void
    {
        $this->getJson('/api/homepage/content')
            ->assertOk()
            ->assertJsonPath('data.payload.hero.title', 'Bring Nature Home')
            ->assertJsonCount(3, 'data.payload.features');
    }

    public function test_admin_can_update_homepage_content(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/homepage', [
            'payload' => [
                'hero' => [
                    'title' => 'Grow With Cozy Care',
                ],
            ],
        ])->assertOk()
            ->assertJsonPath('data.payload.hero.title', 'Grow With Cozy Care')
            ->assertJsonPath('data.payload.hero.primary_cta.path', '/plants');

        $this->getJson('/api/homepage/content')
            ->assertOk()
            ->assertJsonPath('data.payload.hero.title', 'Grow With Cozy Care');
    }

    public function test_customer_cannot_update_homepage_content(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));

        $this->putJson('/api/admin/homepage', ['payload' => []])
            ->assertForbidden();
    }
}
