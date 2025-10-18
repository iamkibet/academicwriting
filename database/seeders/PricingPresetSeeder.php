<?php

namespace Database\Seeders;

use App\Models\PricingPreset;
use Illuminate\Database\Seeder;

class PricingPresetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $presets = [
            // High School - Standard
            [
                'name' => 'High School Essay - Standard',
                'academic_level' => 'high_school',
                'service_type' => 'essay',
                'deadline_type' => 'standard',
                'base_price_per_page' => 10.00,
                'multiplier' => 1.00,
            ],
            [
                'name' => 'High School Research Paper - Standard',
                'academic_level' => 'high_school',
                'service_type' => 'research_paper',
                'deadline_type' => 'standard',
                'base_price_per_page' => 12.50,
                'multiplier' => 1.25,
            ],
            [
                'name' => 'High School Essay - Rush',
                'academic_level' => 'high_school',
                'service_type' => 'essay',
                'deadline_type' => 'rush',
                'base_price_per_page' => 15.00,
                'multiplier' => 1.50,
            ],
            [
                'name' => 'High School Essay - Ultra Rush',
                'academic_level' => 'high_school',
                'service_type' => 'essay',
                'deadline_type' => 'ultra_rush',
                'base_price_per_page' => 20.00,
                'multiplier' => 2.00,
            ],

            // College - Standard
            [
                'name' => 'College Essay - Standard',
                'academic_level' => 'college',
                'service_type' => 'essay',
                'deadline_type' => 'standard',
                'base_price_per_page' => 12.00,
                'multiplier' => 1.20,
            ],
            [
                'name' => 'College Research Paper - Standard',
                'academic_level' => 'college',
                'service_type' => 'research_paper',
                'deadline_type' => 'standard',
                'base_price_per_page' => 15.00,
                'multiplier' => 1.50,
            ],
            [
                'name' => 'College Essay - Rush',
                'academic_level' => 'college',
                'service_type' => 'essay',
                'deadline_type' => 'rush',
                'base_price_per_page' => 18.00,
                'multiplier' => 1.80,
            ],
            [
                'name' => 'College Essay - Ultra Rush',
                'academic_level' => 'college',
                'service_type' => 'essay',
                'deadline_type' => 'ultra_rush',
                'base_price_per_page' => 24.00,
                'multiplier' => 2.40,
            ],

            // Graduate - Standard
            [
                'name' => 'Graduate Essay - Standard',
                'academic_level' => 'graduate',
                'service_type' => 'essay',
                'deadline_type' => 'standard',
                'base_price_per_page' => 15.00,
                'multiplier' => 1.50,
            ],
            [
                'name' => 'Graduate Research Paper - Standard',
                'academic_level' => 'graduate',
                'service_type' => 'research_paper',
                'deadline_type' => 'standard',
                'base_price_per_page' => 18.75,
                'multiplier' => 1.875,
            ],
            [
                'name' => 'Graduate Thesis - Standard',
                'academic_level' => 'graduate',
                'service_type' => 'thesis',
                'deadline_type' => 'standard',
                'base_price_per_page' => 25.00,
                'multiplier' => 2.50,
            ],
            [
                'name' => 'Graduate Essay - Rush',
                'academic_level' => 'graduate',
                'service_type' => 'essay',
                'deadline_type' => 'rush',
                'base_price_per_page' => 22.50,
                'multiplier' => 2.25,
            ],
            [
                'name' => 'Graduate Essay - Ultra Rush',
                'academic_level' => 'graduate',
                'service_type' => 'essay',
                'deadline_type' => 'ultra_rush',
                'base_price_per_page' => 30.00,
                'multiplier' => 3.00,
            ],

            // PhD - Standard
            [
                'name' => 'PhD Essay - Standard',
                'academic_level' => 'phd',
                'service_type' => 'essay',
                'deadline_type' => 'standard',
                'base_price_per_page' => 20.00,
                'multiplier' => 2.00,
            ],
            [
                'name' => 'PhD Research Paper - Standard',
                'academic_level' => 'phd',
                'service_type' => 'research_paper',
                'deadline_type' => 'standard',
                'base_price_per_page' => 25.00,
                'multiplier' => 2.50,
            ],
            [
                'name' => 'PhD Dissertation - Standard',
                'academic_level' => 'phd',
                'service_type' => 'dissertation',
                'deadline_type' => 'standard',
                'base_price_per_page' => 40.00,
                'multiplier' => 4.00,
            ],
            [
                'name' => 'PhD Essay - Rush',
                'academic_level' => 'phd',
                'service_type' => 'essay',
                'deadline_type' => 'rush',
                'base_price_per_page' => 30.00,
                'multiplier' => 3.00,
            ],
            [
                'name' => 'PhD Essay - Ultra Rush',
                'academic_level' => 'phd',
                'service_type' => 'essay',
                'deadline_type' => 'ultra_rush',
                'base_price_per_page' => 40.00,
                'multiplier' => 4.00,
            ],
        ];

        foreach ($presets as $preset) {
            PricingPreset::create($preset);
        }
    }
}
