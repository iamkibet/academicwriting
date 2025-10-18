<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService
    ) {}

    /**
     * Get wallet balance and info
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $walletBalance = $this->walletService->getWalletBalance($user);
        $statistics = $this->walletService->getWalletStatistics($user);

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $walletBalance,
                'formatted_balance' => '$' . number_format($walletBalance, 2),
                'statistics' => $statistics,
            ],
        ]);
    }

    /**
     * Get wallet transactions
     */
    public function transactions(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->query('limit', 50);
        $transactions = $this->walletService->getWalletTransactions($user, $limit);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Top up wallet with PayPal
     */
    public function topUp(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'amount' => 'required|numeric|min:1|max:1000',
            'paypal_transaction_id' => 'required|string',
        ]);

        $result = $this->walletService->topUpWallet(
            $user,
            $request->amount,
            $request->paypal_transaction_id
        );

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result,
        ], $result['success'] ? 200 : 400);
    }

    /**
     * Get wallet statistics (admin only)
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view wallet statistics',
            ], 403);
        }

        $stats = $this->walletService->getAllWalletStatistics();
        $usageByMethod = $this->walletService->getWalletUsageByPaymentMethod();

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => $stats,
                'usage_by_method' => $usageByMethod,
            ],
        ]);
    }
}
