<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Primary Admin Account
        User::updateOrCreate(
            ['email' => 'admin@cozycare.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Dedicated Brand Admin Account
        User::updateOrCreate(
            ['email' => 'admin@nepalcozycare.com'],
            [
                'name' => 'Nepal Cozy Care Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Demo customer account for order history and reviews
        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Aayush Shrestha',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
