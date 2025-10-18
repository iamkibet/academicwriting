<?php

namespace App\Http\Controllers;

use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private PaymentService $paymentService,
        private WalletService $walletService
    ) {}

    /**
     * Display the admin dashboard
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            abort(403, 'Only admins can access this dashboard');
        }

        // Get statistics
        $orderStats = $this->orderService->getOrderStatistics();
        $paymentStats = $this->paymentService->getPaymentStatistics();
        $walletStats = $this->walletService->getAllWalletStatistics();

        $stats = [
            'orders' => $orderStats,
            'payments' => $paymentStats,
            'wallets' => $walletStats,
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }
}
