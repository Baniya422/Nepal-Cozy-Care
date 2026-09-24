<?php

namespace Tests\Feature;

use App\Models\AdminSetting;
use App\Models\Plant;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_replacing_blog_image_is_visible_on_public_article(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $created = $this->actingAs($admin)->postJson('/api/admin/blogs', [
            'title' => 'Care guide', 'content' => 'Care instructions',
            'image' => '/images/blog-hero-lush.jpg', 'is_published' => true,
        ])->assertCreated();
        $id = $created->json('blog.id');
        $upload = $this->postJson('/api/upload', [
            'file' => \Illuminate\Http\UploadedFile::fake()->image('replacement.png'),
            'directory' => 'blogs',
        ])->assertCreated();
        $path = $upload->json('data.path');
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($path);
        $this->putJson('/api/admin/blogs/'.$id, ['image' => $path])->assertOk();
        $this->getJson('/api/blogs/'.$id)->assertOk()->assertJsonPath('data.blog.image', $path);
    }

    public function test_admin_products_remain_visible_with_marketplace_disabled(): void
    {
        AdminSetting::current()->update(['vendor_marketplace_enabled' => false]);
        $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $shop = Shop::create([
            'user_id' => $admin->id, 'name' => 'Nepal Cozy Care',
            'slug' => 'nepal-cozy-care', 'status' => Shop::STATUS_APPROVED,
        ]);
        $vendor = Shop::create([
            'user_id' => User::factory()->create()->id, 'name' => 'Vendor',
            'slug' => 'vendor', 'status' => Shop::STATUS_APPROVED,
        ]);
        Plant::create([
            'name' => 'Vendor plant', 'category' => 'Indoor', 'price' => 100,
            'stock' => 2, 'is_active' => true, 'approval_status' => Plant::STATUS_APPROVED,
            'shop_id' => $vendor->id,
        ]);

        foreach (['Indoor', 'Pots'] as $category) {
            $this->actingAs($admin)->postJson('/api/admin/plants', [
                'name' => 'New '.$category, 'category' => $category,
                'price' => 100, 'stock' => 2, 'is_active' => true,
            ])->assertCreated()->assertJsonPath('data.plant.shop_id', $shop->id);
        }

        $this->getJson('/api/plants?include_accessories=true')
            ->assertOk()->assertJsonCount(2, 'data.plants');
        $this->getJson('/api/plants')->assertOk()
            ->assertJsonCount(1, 'data.plants')->assertJsonPath('data.plants.0.name', 'New Indoor');
        $this->getJson('/api/admin/plants?per_page=1')->assertOk()
            ->assertJsonPath('data.plants.0.name', 'New Pots');
    }
}
