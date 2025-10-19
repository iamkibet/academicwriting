<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\AcademicRate;
use App\Models\Subject;
use App\Models\OrderRate;
use App\Models\Language;
use App\Models\AdditionalFeature;
use App\Models\WriterCategory;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        // Get existing Academic Levels (created by BasicDataSeeder)
        $highSchool = AcademicLevel::where('level', 'High School')->first();
        $undergraduate = AcademicLevel::where('level', 'Undergraduate')->first();
        $masters = AcademicLevel::where('level', 'Masters')->first();
        $phd = AcademicLevel::where('level', 'Ph.D')->first();

        // Create Academic Rates for High School
        $highSchool->rates()->createMany([
            ['hours' => 72, 'label' => '3 Days', 'cost' => 5.00],
            ['hours' => 48, 'label' => '2 Days', 'cost' => 6.00],
            ['hours' => 24, 'label' => '1 Day', 'cost' => 8.00],
            ['hours' => 12, 'label' => '12 Hours', 'cost' => 12.00],
            ['hours' => 6, 'label' => '6 Hours', 'cost' => 18.00],
            ['hours' => 3, 'label' => '3 Hours', 'cost' => 24.00],
        ]);

        // Create Academic Rates for Undergraduate
        $undergraduate->rates()->createMany([
            ['hours' => 72, 'label' => '3 Days', 'cost' => 8.00],
            ['hours' => 48, 'label' => '2 Days', 'cost' => 10.00],
            ['hours' => 24, 'label' => '1 Day', 'cost' => 12.00],
            ['hours' => 12, 'label' => '12 Hours', 'cost' => 18.00],
            ['hours' => 6, 'label' => '6 Hours', 'cost' => 24.00],
            ['hours' => 3, 'label' => '3 Hours', 'cost' => 32.00],
        ]);

        // Create Academic Rates for Masters
        $masters->rates()->createMany([
            ['hours' => 72, 'label' => '3 Days', 'cost' => 12.00],
            ['hours' => 48, 'label' => '2 Days', 'cost' => 14.00],
            ['hours' => 24, 'label' => '1 Day', 'cost' => 18.00],
            ['hours' => 12, 'label' => '12 Hours', 'cost' => 24.00],
            ['hours' => 6, 'label' => '6 Hours', 'cost' => 32.00],
            ['hours' => 3, 'label' => '3 Hours', 'cost' => 40.00],
        ]);

        // Create Academic Rates for Ph.D
        $phd->rates()->createMany([
            ['hours' => 72, 'label' => '3 Days', 'cost' => 16.00],
            ['hours' => 48, 'label' => '2 Days', 'cost' => 18.00],
            ['hours' => 24, 'label' => '1 Day', 'cost' => 24.00],
            ['hours' => 12, 'label' => '12 Hours', 'cost' => 32.00],
            ['hours' => 6, 'label' => '6 Hours', 'cost' => 40.00],
            ['hours' => 3, 'label' => '3 Hours', 'cost' => 50.00],
        ]);

        // Subjects are created by BasicDataSeeder

        // Create Order Rates
        OrderRate::create([
            'hours' => 24,
            'label' => '1 Day',
            'high_school' => 8.00,
            'under_graduate' => 12.00,
            'masters' => 18.00,
            'phd' => 24.00,
        ]);
        OrderRate::create([
            'hours' => 12,
            'label' => '12 Hours',
            'high_school' => 12.00,
            'under_graduate' => 18.00,
            'masters' => 24.00,
            'phd' => 32.00,
        ]);
        OrderRate::create([
            'hours' => 6,
            'label' => '6 Hours',
            'high_school' => 18.00,
            'under_graduate' => 24.00,
            'masters' => 32.00,
            'phd' => 40.00,
        ]);
        OrderRate::create([
            'hours' => 3,
            'label' => '3 Hours',
            'high_school' => 24.00,
            'under_graduate' => 32.00,
            'masters' => 40.00,
            'phd' => 50.00,
        ]);
        OrderRate::create([
            'hours' => 48,
            'label' => '2 Days',
            'high_school' => 6.00,
            'under_graduate' => 10.00,
            'masters' => 14.00,
            'phd' => 18.00,
        ]);
        OrderRate::create([
            'hours' => 72,
            'label' => '3 Days',
            'high_school' => 5.00,
            'under_graduate' => 8.00,
            'masters' => 12.00,
            'phd' => 16.00,
        ]);

        // Create Languages
        Language::create(['label' => 'English (US)', 'inc_type' => 'percent', 'amount' => 0]);
        Language::create(['label' => 'English (UK)', 'inc_type' => 'percent', 'amount' => 0]);
        Language::create(['label' => 'English (Australia)', 'inc_type' => 'percent', 'amount' => 0]);
        Language::create(['label' => 'English (Canada)', 'inc_type' => 'percent', 'amount' => 0]);
        Language::create(['label' => 'Spanish', 'inc_type' => 'percent', 'amount' => 15]);
        Language::create(['label' => 'French', 'inc_type' => 'percent', 'amount' => 20]);
        Language::create(['label' => 'German', 'inc_type' => 'percent', 'amount' => 25]);

        // Create Additional Features
        AdditionalFeature::create([
            'name' => 'Plagiarism Report',
            'description' => 'Detailed plagiarism report with originality score',
            'type' => 'fixed',
            'amount' => 15.00,
            'sort_order' => 1,
        ]);
        AdditionalFeature::create([
            'name' => 'Priority Support',
            'description' => '24/7 priority customer support',
            'type' => 'fixed',
            'amount' => 25.00,
            'sort_order' => 2,
        ]);
        AdditionalFeature::create([
            'name' => 'Unlimited Revisions',
            'description' => 'Unlimited revisions until satisfaction',
            'type' => 'percent',
            'amount' => 20.00,
            'sort_order' => 3,
        ]);
        AdditionalFeature::create([
            'name' => 'Progressive Delivery',
            'description' => 'Receive work in parts as it\'s completed',
            'type' => 'fixed',
            'amount' => 10.00,
            'sort_order' => 4,
        ]);
        AdditionalFeature::create([
            'name' => 'Top Writer',
            'description' => 'Assign to our most experienced writers',
            'type' => 'percent',
            'amount' => 30.00,
            'sort_order' => 5,
        ]);

        // Create Writer Categories
        WriterCategory::create([
            'name' => 'Standard Writer',
            'description' => 'Professional writers with bachelor\'s degree',
            'type' => 'percent',
            'amount' => 0.00,
        ]);
        WriterCategory::create([
            'name' => 'Premium Writer',
            'description' => 'Writers with master\'s degree and 3+ years experience',
            'type' => 'percent',
            'amount' => 25.00,
        ]);
        WriterCategory::create([
            'name' => 'Expert Writer',
            'description' => 'PhD holders with 5+ years experience',
            'type' => 'percent',
            'amount' => 50.00,
        ]);
        WriterCategory::create([
            'name' => 'Native Speaker',
            'description' => 'Native English speakers from US/UK/Australia',
            'type' => 'percent',
            'amount' => 15.00,
        ]);
    }
}