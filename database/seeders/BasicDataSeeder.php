<?php

namespace Database\Seeders;

use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\ServiceType;
use App\Models\Language;
use App\Models\OrderRate;
use Illuminate\Database\Seeder;

class BasicDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Academic Levels
        $academicLevels = [
            ['level' => 'High School', 'is_active' => true],
            ['level' => 'Undergraduate', 'is_active' => true],
            ['level' => 'Masters', 'is_active' => true],
            ['level' => 'Ph.D', 'is_active' => true],
        ];

        foreach ($academicLevels as $level) {
            AcademicLevel::firstOrCreate(
                ['level' => $level['level']],
                $level
            );
        }

        // Seed Subjects (Academic Disciplines)
        $subjects = [
            ['name' => 'Mathematics', 'slug' => 'mathematics', 'description' => 'Mathematical concepts and problem-solving', 'is_active' => true],
            ['name' => 'Science', 'slug' => 'science', 'description' => 'Scientific principles and research', 'is_active' => true],
            ['name' => 'Literature', 'slug' => 'literature', 'description' => 'Literary analysis and writing', 'is_active' => true],
            ['name' => 'History', 'slug' => 'history', 'description' => 'Historical research and analysis', 'is_active' => true],
            ['name' => 'Engineering', 'slug' => 'engineering', 'description' => 'Engineering principles and applications', 'is_active' => true],
            ['name' => 'Medicine', 'slug' => 'medicine', 'description' => 'Medical research and healthcare', 'is_active' => true],
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Business studies and management', 'is_active' => true],
            ['name' => 'Psychology', 'slug' => 'psychology', 'description' => 'Psychological research and analysis', 'is_active' => true],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['slug' => $subject['slug']],
                $subject
            );
        }

        // Seed Service Types
        $serviceTypes = [
            ['name' => 'Essay', 'slug' => 'essay', 'description' => 'Academic essays and papers', 'inc_type' => 'percent', 'amount' => 0, 'is_active' => true],
            ['name' => 'Research Paper', 'slug' => 'research-paper', 'description' => 'In-depth research papers', 'inc_type' => 'percent', 'amount' => 20, 'is_active' => true],
            ['name' => 'Thesis', 'slug' => 'thesis', 'description' => 'Master\'s level thesis', 'inc_type' => 'percent', 'amount' => 50, 'is_active' => true],
            ['name' => 'Dissertation', 'slug' => 'dissertation', 'description' => 'PhD level dissertation', 'inc_type' => 'percent', 'amount' => 100, 'is_active' => true],
            ['name' => 'Programming', 'slug' => 'programming', 'description' => 'Programming and coding projects', 'inc_type' => 'percent', 'amount' => 30, 'is_active' => true],
            ['name' => 'Calculations', 'slug' => 'calculations', 'description' => 'Mathematical calculations and analysis', 'inc_type' => 'percent', 'amount' => 25, 'is_active' => true],
        ];

        foreach ($serviceTypes as $serviceType) {
            ServiceType::firstOrCreate(
                ['slug' => $serviceType['slug']],
                $serviceType
            );
        }

        // Seed Languages
        $languages = [
            ['label' => 'English', 'inc_type' => 'percent', 'amount' => 0, 'is_active' => true],
            ['label' => 'Spanish', 'inc_type' => 'percent', 'amount' => 10, 'is_active' => true],
            ['label' => 'French', 'inc_type' => 'percent', 'amount' => 10, 'is_active' => true],
            ['label' => 'German', 'inc_type' => 'percent', 'amount' => 10, 'is_active' => true],
            ['label' => 'Italian', 'inc_type' => 'percent', 'amount' => 10, 'is_active' => true],
            ['label' => 'Portuguese', 'inc_type' => 'percent', 'amount' => 10, 'is_active' => true],
            ['label' => 'Other', 'inc_type' => 'percent', 'amount' => 15, 'is_active' => true],
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate(
                ['label' => $language['label']],
                $language
            );
        }

        // Seed Order Rates (Deadline Types)
        $orderRates = [
            ['label' => '3 Days', 'hours' => 72, 'high_school' => 8.00, 'under_graduate' => 10.00, 'masters' => 12.00, 'phd' => 15.00, 'is_active' => true],
            ['label' => '2 Days', 'hours' => 48, 'high_school' => 10.00, 'under_graduate' => 12.00, 'masters' => 15.00, 'phd' => 18.00, 'is_active' => true],
            ['label' => '1 Day', 'hours' => 24, 'high_school' => 12.00, 'under_graduate' => 15.00, 'masters' => 18.00, 'phd' => 22.00, 'is_active' => true],
            ['label' => '12 Hours', 'hours' => 12, 'high_school' => 15.00, 'under_graduate' => 18.00, 'masters' => 22.00, 'phd' => 25.00, 'is_active' => true],
            ['label' => '6 Hours', 'hours' => 6, 'high_school' => 18.00, 'under_graduate' => 22.00, 'masters' => 25.00, 'phd' => 30.00, 'is_active' => true],
            ['label' => '3 Hours', 'hours' => 3, 'high_school' => 22.00, 'under_graduate' => 25.00, 'masters' => 30.00, 'phd' => 35.00, 'is_active' => true],
        ];

        foreach ($orderRates as $rate) {
            OrderRate::firstOrCreate(
                ['label' => $rate['label']],
                $rate
            );
        }
    }
}