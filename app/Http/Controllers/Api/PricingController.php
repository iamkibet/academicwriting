<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function __construct(
        private PricingService $pricingService
    ) {}

    /**
     * Get pricing matrix
     */
    public function matrix(): JsonResponse
    {
        $matrix = $this->pricingService->getPricingMatrix();

        return response()->json([
            'success' => true,
            'data' => $matrix,
        ]);
    }

    /**
     * Get price estimate
     */
    public function estimate(Request $request): JsonResponse
    {
        $request->validate([
            'academic_level_id' => 'required|exists:academic_levels,id',
            'service_type_id' => 'required|exists:subjects,id',
            'deadline_type_id' => 'required|exists:order_rates,id',
            'language_id' => 'required|exists:languages,id',
            'pages' => 'required|integer|min:1|max:100',
        ]);

        $estimate = $this->pricingService->getPriceEstimate(
            $request->academic_level_id,
            $request->service_type_id,
            $request->deadline_type_id,
            $request->language_id,
            $request->pages
        );

        return response()->json([
            'success' => true,
            'data' => $estimate,
        ]);
    }

    /**
     * Get all pricing presets (admin only)
     */
    public function presets(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view pricing presets',
            ], 403);
        }

        $presets = $this->pricingService->getAllPresets();

        return response()->json([
            'success' => true,
            'data' => $presets,
        ]);
    }

    /**
     * Get available options
     */
    public function options(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'academic_levels' => $this->pricingService->getAcademicLevels(),
                'service_types' => $this->pricingService->getServiceTypes(),
                'deadline_types' => $this->pricingService->getDeadlineTypes(),
                'languages' => $this->pricingService->getLanguages(),
                'deadline_multipliers' => $this->pricingService->getDeadlineMultipliers(),
                'academic_level_multipliers' => $this->pricingService->getAcademicLevelMultipliers(),
                'service_type_multipliers' => $this->pricingService->getServiceTypeMultipliers(),
            ],
        ]);
    }
}
