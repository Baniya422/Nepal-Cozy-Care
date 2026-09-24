<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_plant_details_round_trip_to_admin_catalog_and_quiz(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $details = [
            'name' => 'New quiz plant', 'price' => 850, 'discount_percent' => 15, 'stock' => 10,
            'category' => 'Indoor Plants', 'soil' => 'Perlite mix', 'difficulty' => 'Beginner Friendly',
            'light' => 'Bright Indirect', 'humidity' => 'Drier Air', 'rooms' => ['Home Office'],
            'is_active' => true, 'is_best_seller' => true,
        ];
        $response = $this->actingAs($admin)->postJson('/api/admin/plants', $details)->assertCreated();
        $id = $response->json('data.plant.id');
        foreach (['/api/admin/plants', '/api/plants'] as $endpoint) {
            $this->getJson($endpoint)->assertOk()->assertJsonPath('data.plants.0.soil', 'Perlite mix')
                ->assertJsonPath('data.plants.0.rooms', ['Home Office'])
                ->assertJsonPath('data.plants.0.discount_percent', 15);
        }
        $this->getJson('/api/plants?view=listing')->assertOk()
            ->assertJsonPath('data.plants.0.discount_percent', 15)
            ->assertJsonPath('data.plants.0.is_best_seller', true);
        $this->putJson('/api/admin/plants/'.$id, ['discount_percent' => 0, 'rooms' => []])->assertOk();
        $this->getJson('/api/plants/'.$id)->assertOk()->assertJsonPath('data.plant.discount_percent', 0)
            ->assertJsonPath('data.plant.rooms', []);
        $this->putJson('/api/admin/plants/'.$id, ['discount_percent' => 100])->assertUnprocessable();
    }

    public function test_blog_profile_and_sections_round_trip_and_can_be_cleared(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $details = [
            'title' => 'Full article', 'content' => '## First heading'."\n".'Real article content',
            'image' => '/images/snake.jpg', 'author' => 'Priya Shrestha', 'is_published' => true,
            'author_role' => 'Horticulturist', 'author_bio' => 'Growing plants in Nepal.',
            'author_image' => 'blogs/priya.webp', 'read_time' => '8 min read',
            'tags' => ['Nepal', 'Care'], 'tips' => ['Check the soil'], 'takeaways' => ['Use drainage'],
            'meta_title' => 'Plant care guide', 'meta_description' => 'Helpful plant advice.',
        ];
        $created = $this->actingAs($admin)->postJson('/api/admin/blogs', $details)->assertCreated();
        $id = $created->json('blog.id');
        foreach (['/api/blogs/'.$id => 'data.blog', '/api/admin/blogs' => 'data.blogs.0', '/api/blogs' => 'data.blogs.0'] as $url => $path) {
            $response = $this->getJson($url)->assertOk();
            foreach ($details as $key => $value) $response->assertJsonPath($path.'.'.$key, $value);
        }
        $this->putJson('/api/admin/blogs/'.$id, [
            'author_image' => null, 'author_bio' => '', 'tips' => [], 'takeaways' => [], 'tags' => [],
        ])->assertOk();
        $this->getJson('/api/blogs/'.$id)->assertOk()->assertJsonPath('data.blog.author_image', null)
            ->assertJsonPath('data.blog.tips', [])->assertJsonPath('data.blog.tags', []);
        $this->putJson('/api/admin/blogs/'.$id, ['tips' => 'invalid'])->assertUnprocessable();
    }
}
