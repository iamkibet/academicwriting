<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class RewardsController extends Controller
{
    /**
     * Display the user's rewards page
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        // Get user's coupon usages
        $usedCoupons = $user->couponUsages()
            ->with('coupon')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get total spending
        $totalSpending = $user->getTotalSpending();
        
        // Get loyalty discount
        $loyaltyDiscount = $user->getLoyaltyDiscount();

        // Get user's reward account
        $reward = $user->getOrCreateReward();

        // Get available coupons
        $availableCoupons = Coupon::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->get();

        // Calculate loyalty progress
        $nextTier = null;
        $progress = 0;
        
        if ($totalSpending < 500) {
            $nextTier = ['threshold' => 500, 'discount' => 5, 'name' => '5% off'];
            $progress = ($totalSpending / 500) * 100;
        } elseif ($totalSpending < 1000) {
            $nextTier = ['threshold' => 1000, 'discount' => 10, 'name' => '10% off'];
            $progress = (($totalSpending - 500) / 500) * 100;
        } elseif ($totalSpending < 2000) {
            $nextTier = ['threshold' => 2000, 'discount' => 15, 'name' => '15% off'];
            $progress = (($totalSpending - 1000) / 1000) * 100;
        }

        return Inertia::render('rewards/index', [
            'usedCoupons' => $usedCoupons,
            'availableCoupons' => $availableCoupons,
            'totalSpending' => $totalSpending,
            'loyaltyDiscount' => $loyaltyDiscount,
            'reward' => $reward,
            'nextTier' => $nextTier,
            'progress' => $progress,
        ]);
    }

    /**
     * Validate and apply a coupon
     */
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code',
            ]);
        }

        if (!$coupon->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon is not valid',
            ]);
        }

        if (!$coupon->canBeUsedBy($request->user()->id)) {
            return response()->json([
                'valid' => false,
                'message' => 'You have already used this coupon',
            ]);
        }

        return response()->json([
            'valid' => true,
            'coupon' => $coupon,
            'message' => 'Coupon is valid',
        ]);
    }
}
