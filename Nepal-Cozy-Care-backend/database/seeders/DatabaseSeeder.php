<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create admin user (required for admin access)
        $this->call(AdminUserSeeder::class);
        
        // ======================================================================
        // DEMO DATA SEEDERS (OPTIONAL - Comment out for production)
        // ======================================================================
        // Uncomment the lines below if you want to seed demo/sample data
        
        // Create sample plants (9 demo plants)
        // $this->call(PlantSeeder::class);
        
        // Create sample care tips (demo care tips)
        // $this->call(CareTipSeeder::class);
        
        // ======================================================================
        // For production: Add real data manually through the admin panel
        // ======================================================================
    }
}
