<?php

namespace App\Services;

use App\Models\PricingPreset;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\ServiceType;
use App\Models\Language;
use App\Models\OrderRate;

class PricingService
{
    /**
     * Calculate price for order
     */
    public function calculatePrice(string $academicLevel, string $serviceType, string $deadlineType, int $pages): float
    {
        return PricingPreset::calculatePrice($academicLevel, $serviceType, $deadlineType, $pages);
    }

    /**
     * Get all pricing presets
     */
    public function getAllPresets()
    {
        return PricingPreset::active()->orderBy('academic_level')->orderBy('service_type')->get();
    }

    /**
     * Get presets by academic level
     */
    public function getPresetsByAcademicLevel(string $academicLevel)
    {
        return PricingPreset::active()->byAcademicLevel($academicLevel)->get();
    }

    /**
     * Get presets by service type
     */
    public function getPresetsByServiceType(string $serviceType)
    {
        return PricingPreset::active()->byServiceType($serviceType)->get();
    }

    /**
     * Get pricing matrix for frontend
     */
    public function getPricingMatrix(): array
    {
        $presets = $this->getAllPresets();
        $matrix = [];

        foreach ($presets as $preset) {
            $matrix[$preset->academic_level][$preset->service_type][$preset->deadline_type] = [
                'id' => $preset->id,
                'name' => $preset->name,
                'base_price_per_page' => $preset->base_price_per_page,
                'multiplier' => $preset->multiplier,
                'total_price_1_page' => $preset->getTotalPrice(1),
                'total_price_5_pages' => $preset->getTotalPrice(5),
                'total_price_10_pages' => $preset->getTotalPrice(10),
            ];
        }

        return $matrix;
    }

    /**
     * Update pricing preset
     */
    public function updatePreset(int $presetId, array $data): PricingPreset
    {
        $preset = PricingPreset::findOrFail($presetId);
        $preset->update($data);
        return $preset;
    }

    /**
     * Create new pricing preset
     */
    public function createPreset(array $data): PricingPreset
    {
        return PricingPreset::create($data);
    }

    /**
     * Get price estimate for frontend
     */
    public function getPriceEstimate(int $academicLevelId, int $serviceTypeId, int $deadlineHours, int $languageId, int $pages, array $additionalFeatures = []): array
    {
        // Get the related models
        $academicLevel = AcademicLevel::find($academicLevelId);
        $serviceType = Subject::find($serviceTypeId);
        $language = Language::find($languageId);

        // Calculate base price based on academic level and deadline (hours)
        $basePrice = $this->getBasePriceForAcademicLevel($academicLevelId, $deadlineHours);
        
        // Apply service type increment
        $serviceIncrement = $this->getServiceTypeIncrement($serviceTypeId);
        
        // Apply language increment
        $languageIncrement = $this->getLanguageIncrement($languageId);
        
        // Calculate additional features cost
        $additionalFeaturesCost = $this->calculateAdditionalFeaturesCost($additionalFeatures, $basePrice * $pages * $serviceIncrement * $languageIncrement);
        
        // Calculate total price
        $totalPrice = $basePrice * $pages * $serviceIncrement * $languageIncrement + $additionalFeaturesCost;

        return [
            'academic_level_id' => $academicLevelId,
            'service_type_id' => $serviceTypeId,
            'deadline_hours' => $deadlineHours,
            'language_id' => $languageId,
            'pages' => $pages,
            'base_price_per_page' => $basePrice,
            'service_increment' => $serviceIncrement,
            'language_increment' => $languageIncrement,
            'additional_features_cost' => $additionalFeaturesCost,
            'total_price' => $totalPrice,
            'formatted_total_price' => '$' . number_format($totalPrice, 2),
            'price_breakdown' => [
                'base_price' => $basePrice,
                'service_increment' => $serviceIncrement,
                'language_increment' => $languageIncrement,
                'pages' => $pages,
                'additional_features_cost' => $additionalFeaturesCost,
                'calculation' => $totalPrice,
            ],
        ];
    }

    /**
     * Get available academic levels from database
     */
    public function getAcademicLevels(): array
    {
        return AcademicLevel::where('is_active', true)
            ->pluck('level', 'id')
            ->toArray();
    }

    /**
     * Get available service types (subjects) from database
     */
    public function getServiceTypes(): array
    {
        return Subject::where('is_active', true)
            ->pluck('name', 'id')
            ->toArray();
    }

    /**
     * Get available deadline types for a specific academic level
     */
    public function getDeadlineTypes(int $academicLevelId = null): array
    {
        $query = \App\Models\AcademicRate::where('deleted', false);
        
        if ($academicLevelId) {
            $query->where('academic_level_id', $academicLevelId);
        }
        
        return $query->select('hours', 'label')
            ->orderBy('hours')
            ->get()
            ->pluck('label', 'hours')
            ->toArray();
    }

    /**
     * Get available languages from database
     */
    public function getLanguages(): array
    {
        return Language::where('is_active', true)
            ->pluck('label', 'id')
            ->toArray();
    }

    /**
     * Get deadline multipliers
     */
    public function getDeadlineMultipliers(): array
    {
        return [
            'standard' => 1.0,
            'rush' => 1.5,
            'ultra_rush' => 2.0,
        ];
    }

    /**
     * Get academic level multipliers
     */
    public function getAcademicLevelMultipliers(): array
    {
        return [
            'high_school' => 1.0,
            'college' => 1.2,
            'graduate' => 1.5,
            'phd' => 2.0,
        ];
    }

    /**
     * Get service type multipliers
     */
    public function getServiceTypeMultipliers(): array
    {
        return [
            'essay' => 1.0,
            'research_paper' => 1.25,
            'thesis' => 2.0,
            'dissertation' => 3.0,
        ];
    }

    /**
     * Get base price for academic level and deadline type
     */
    private function getBasePriceForAcademicLevel(int $academicLevelId, int $deadlineTypeId): float
    {
        // Get the academic rate for the specific academic level and deadline (hours)
        $academicRate = \App\Models\AcademicRate::where('academic_level_id', $academicLevelId)
            ->where('hours', $deadlineTypeId)
            ->where('deleted', false)
            ->first();
        
        if (!$academicRate) {
            return 10.0; // Default price
        }
        
        return (float) $academicRate->cost;
    }

    /**
     * Get service type increment
     */
    private function getServiceTypeIncrement(int $serviceTypeId): float
    {
        $serviceType = \App\Models\ServiceType::find($serviceTypeId);
        
        if (!$serviceType) {
            return 1.0; // Default increment
        }

        if ($serviceType->inc_type === 'percent') {
            return 1 + ($serviceType->amount / 100); // Convert percentage to multiplier
        } else {
            return 1.0 + ($serviceType->amount / 100); // Convert money to percentage equivalent
        }
    }

    /**
     * Get language increment
     */
    private function getLanguageIncrement(int $languageId): float
    {
        $language = Language::find($languageId);
        
        if (!$language) {
            return 1.0; // Default increment
        }

        if ($language->inc_type === 'percent') {
            return 1 + ($language->amount / 100); // Convert percentage to multiplier
        } else {
            return 1.0 + ($language->amount / 100); // Convert money to percentage equivalent
        }
    }

    /**
     * Calculate additional features cost
     */
    private function calculateAdditionalFeaturesCost(array $additionalFeatureIds, float $basePrice): float
    {
        if (empty($additionalFeatureIds)) {
            return 0.0;
        }

        $totalCost = 0.0;
        
        foreach ($additionalFeatureIds as $featureId) {
            $feature = \App\Models\AdditionalFeature::find($featureId);
            
            if (!$feature || !$feature->is_active) {
                continue;
            }

            if ($feature->type === 'fixed') {
                // Fixed amount - add directly
                $totalCost += $feature->amount;
            } else {
                // Percentage - calculate based on base price
                $totalCost += $basePrice * ($feature->amount / 100);
            }
        }

        return $totalCost;
    }
}
