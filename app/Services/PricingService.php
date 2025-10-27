<?php

namespace App\Services;

use App\Models\PricingPreset;
use App\Models\AcademicLevel;
use App\Models\Subject;
use App\Models\ServiceType;
use App\Models\Language;
use App\Models\OrderRate;
use App\Models\AdditionalFeature;
use App\Models\Order;

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
        $basePriceForOrder = $basePrice * $pages * $serviceIncrement * $languageIncrement;
        $additionalFeaturesCost = $this->calculateAdditionalFeaturesCost($additionalFeatures, $basePriceForOrder);
        
        // Calculate total price
        $totalPrice = $basePriceForOrder + $additionalFeaturesCost;
        
        // Log for debugging
        \Log::info('Price estimate calculation', [
            'academic_level_id' => $academicLevelId,
            'service_type_id' => $serviceTypeId,
            'deadline_hours' => $deadlineHours,
            'language_id' => $languageId,
            'pages' => $pages,
            'base_price' => $basePrice,
            'service_increment' => $serviceIncrement,
            'language_increment' => $languageIncrement,
            'base_price_for_order' => $basePriceForOrder,
            'additional_features_cost' => $additionalFeaturesCost,
            'total_price' => $totalPrice
        ]);

        return [
            'academic_level_id' => $academicLevelId,
            'service_type_id' => $serviceTypeId,
            'deadline_hours' => $deadlineHours,
            'language_id' => $languageId,
            'pages' => $pages,
            'base_price_per_page' => $basePrice,
            'price_per_page' => $totalPrice / $pages, // Total price per page including additional features
            'service_increment' => $serviceIncrement,
            'language_increment' => $languageIncrement,
            'additional_features_cost' => $additionalFeaturesCost,
            'total_price' => $totalPrice,
            'formatted_total_price' => '$' . number_format($totalPrice, 2),
            'price_breakdown' => [
                'base_price' => $basePrice,
                'price_per_page' => $totalPrice / $pages, // Total price per page including additional features
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
     * Get available additional features from database
     */
    public function getAdditionalFeatures(): array
    {
        return AdditionalFeature::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->mapWithKeys(function ($feature) {
                return [
                    $feature->id => [
                        'id' => $feature->id,
                        'name' => $feature->name,
                        'type' => $feature->type,
                        'amount' => $feature->amount,
                        'description' => $feature->description,
                        'price_display' => $feature->type === 'fixed' 
                            ? '$' . number_format($feature->amount, 2)
                            : $feature->amount . '%'
                    ]
                ];
            })
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
     * Get base price per page for an existing order
     * Use the same calculation as getPriceEstimate to ensure consistency
     */
    public function getBasePricePerPageForOrder(Order $order): float
    {
        // Convert additional features from stored format to ID format for getPriceEstimate
        $additionalFeatures = [];
        foreach ($order->additional_features as $feature) {
            $additionalFeatures[] = $feature['id'];
        }
        
        // Use the same calculation as getPriceEstimate
        $priceEstimate = $this->getPriceEstimate(
            $order->academic_level_id,
            $order->service_type_id,
            $order->deadline_hours,
            $order->language_id,
            $order->pages,
            $additionalFeatures
        );
        
        // Return the base price per page from the estimate
        $basePricePerPage = $priceEstimate['base_price_per_page'];
        
        // Log for debugging
        \Log::info('Base price per page calculation for order ' . $order->id, [
            'academic_level_id' => $order->academic_level_id,
            'deadline_hours' => $order->deadline_hours,
            'service_type_id' => $order->service_type_id,
            'language_id' => $order->language_id,
            'base_price_per_page' => $basePricePerPage
        ]);
        
        return $basePricePerPage;
    }


    /**
     * Calculate additional features cost
     * Handles both ID format (from frontend) and array format (from order data)
     */
    private function calculateAdditionalFeaturesCost(array $additionalFeatures, float $basePrice): float
    {
        if (empty($additionalFeatures)) {
            return 0.0;
        }

        $totalCost = 0.0;
        
        foreach ($additionalFeatures as $feature) {
            // Handle ID format (from frontend) - convert to feature object
            if (is_numeric($feature)) {
                $featureModel = \App\Models\AdditionalFeature::find($feature);
                if (!$featureModel || !$featureModel->is_active) {
                    continue;
                }
                
                if ($featureModel->type === 'fixed') {
                    $totalCost += $featureModel->amount;
                } else {
                    $totalCost += $basePrice * ($featureModel->amount / 100);
                }
            }
            // Handle array format (from order data)
            else if (is_array($feature) && isset($feature['type']) && isset($feature['amount'])) {
                if ($feature['type'] === 'fixed') {
                    $totalCost += $feature['amount'];
                } else {
                    $totalCost += $basePrice * ($feature['amount'] / 100);
                }
            }
        }

        return $totalCost;
    }
}
