<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private WalletService $walletService
    ) {}

    /**
     * Get payment options for an order
     */
    public function getPaymentOptions(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient() || $order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view payment options for this order',
            ], 403);
        }

        if ($order->status !== Order::STATUS_PLACED) {
            return response()->json([
                'success' => false,
                'message' => 'Order is not in placed status',
            ], 400);
        }

        $paymentOptions = $this->walletService->getPaymentOptions($user, $order->price);
        $walletBalance = $this->walletService->getWalletBalance($user);

        return response()->json([
            'success' => true,
            'data' => [
                'order_amount' => $order->price,
                'wallet_balance' => $walletBalance,
                'payment_options' => $paymentOptions,
            ],
        ]);
    }

    /**
     * Pay with wallet
     */
    public function payWithWallet(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient() || $order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to pay for this order',
            ], 403);
        }

        if ($order->status !== Order::STATUS_PLACED) {
            return response()->json([
                'success' => false,
                'message' => 'Order is not in placed status',
            ], 400);
        }

        $result = $this->paymentService->payWithWallet($order);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result,
        ], $result['success'] ? 200 : 400);
    }

    /**
     * Pay with PayPal
     */
    public function payWithPayPal(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient() || $order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to pay for this order',
            ], 403);
        }

        if ($order->status !== Order::STATUS_PLACED) {
            return response()->json([
                'success' => false,
                'message' => 'Order is not in placed status',
            ], 400);
        }

        $request->validate([
            'paypal_transaction_id' => 'required|string',
        ]);

        $result = $this->paymentService->payWithPayPal($order, $request->paypal_transaction_id);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result,
        ], $result['success'] ? 200 : 400);
    }

    /**
     * Pay with hybrid method (wallet + PayPal)
     */
    public function payWithHybrid(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient() || $order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to pay for this order',
            ], 403);
        }

        if ($order->status !== Order::STATUS_PLACED) {
            return response()->json([
                'success' => false,
                'message' => 'Order is not in placed status',
            ], 400);
        }

        $request->validate([
            'wallet_amount' => 'required|numeric|min:0',
            'paypal_transaction_id' => 'required|string',
        ]);

        $walletAmount = $request->wallet_amount;
        $totalAmount = $order->price;

        if ($walletAmount > $totalAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet amount cannot exceed order total',
            ], 400);
        }

        if ($walletAmount < 0) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet amount cannot be negative',
            ], 400);
        }

        $result = $this->paymentService->payWithHybrid($order, $walletAmount, $request->paypal_transaction_id);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result,
        ], $result['success'] ? 200 : 400);
    }

    /**
     * Get payment statistics (admin only)
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view payment statistics',
            ], 403);
        }

        $stats = $this->paymentService->getPaymentStatistics();
        $walletStats = $this->walletService->getAllWalletStatistics();
        $paymentsByMethod = $this->paymentService->getPaymentsByMethod();

        return response()->json([
            'success' => true,
            'data' => [
                'payment_statistics' => $stats,
                'wallet_statistics' => $walletStats,
                'payments_by_method' => $paymentsByMethod,
            ],
        ]);
    }
}
