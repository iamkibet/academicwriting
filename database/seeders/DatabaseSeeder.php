<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create test client
        User::firstOrCreate(
            ['email' => 'client@example.com'],
            [
                'name' => 'Test Client',
                'password' => 'password',
                'role' => 'client',
                'email_verified_at' => now(),
            ]
        );

        // Create test admin
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Test Admin',
                'password' => 'password',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Seed basic data first
        $this->call(BasicDataSeeder::class);
        
        // Then seed pricing presets and settings
        $this->call(PricingPresetSeeder::class);
        $this->call(SettingsSeeder::class);
    }
}
