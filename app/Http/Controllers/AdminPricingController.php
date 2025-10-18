<?php

namespace App\Http\Controllers;

use App\Services\PricingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPricingController extends Controller
{
    public function __construct(
        private PricingService $pricingService
    ) {}

    /**
     * Display pricing management page
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            abort(403, 'Only admins can access this page');
        }

        $presets = $this->pricingService->getAllPresets();

        return Inertia::render('admin/pricing', [
            'presets' => $presets,
        ]);
    }
}
