<?php

namespace App\Http\Controllers;

use App\Services\OrderService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientDashboardController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private WalletService $walletService
    ) {}

    /**
     * Display the client dashboard
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isClient()) {
            abort(403, 'Only clients can access this dashboard');
        }

        // Get client orders
        $orders = $this->orderService->getClientOrders($user);
        
        // Calculate stats
        $stats = [
            'total_orders' => $orders->count(),
            'pending_orders' => $orders->where('status', 'placed')->count(),
            'active_orders' => $orders->whereIn('status', [
                'active', 'assigned', 'in_progress', 'submitted', 'waiting_for_review', 'in_revision'
            ])->count(),
            'completed_orders' => $orders->where('status', 'completed')->count(),
            'cancelled_orders' => $orders->where('status', 'cancelled')->count(),
            'total_spent' => $orders->where('status', 'completed')->sum('price'),
        ];

        // Get wallet data
        $wallet = $this->walletService->getWalletBalance($user);
        $walletStats = $this->walletService->getWalletStatistics($user);
        $walletData = [
            'balance' => $wallet,
            'formatted_balance' => '$' . number_format($wallet, 2),
            'statistics' => $walletStats,
        ];

        // Get recent orders
        $recentOrders = $orders->take(5)->values();

        return Inertia::render('client/dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'stats' => $stats,
            'wallet' => $walletData,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Display client orders with tab filtering
     */
    public function orders(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isClient()) {
            abort(403, 'Only clients can access this dashboard');
        }

        $tab = $request->query('tab', 'recent');
        
        // Get all client orders
        $allOrders = $this->orderService->getClientOrders($user);
        
        // Filter orders based on tab
        $orders = match($tab) {
            'recent' => $allOrders->take(10),
            'active' => $allOrders->whereIn('status', [
                'placed', 'active', 'assigned', 'in_progress', 'submitted', 'waiting_for_review', 'in_revision'
            ]),
            'completed' => $allOrders->where('status', 'completed'),
            'cancelled' => $allOrders->where('status', 'cancelled'),
            default => $allOrders->take(10)
        };

        // Calculate stats
        $stats = [
            'total_orders' => $allOrders->count(),
            'pending_orders' => $allOrders->where('status', 'placed')->count(),
            'active_orders' => $allOrders->whereIn('status', [
                'active', 'assigned', 'in_progress', 'submitted', 'waiting_for_review', 'in_revision'
            ])->count(),
            'completed_orders' => $allOrders->where('status', 'completed')->count(),
            'cancelled_orders' => $allOrders->where('status', 'cancelled')->count(),
            'total_spent' => $allOrders->where('status', 'completed')->sum('price'),
        ];

        // Get wallet data
        $wallet = $this->walletService->getWalletBalance($user);
        $walletStats = $this->walletService->getWalletStatistics($user);
        $walletData = [
            'balance' => $wallet,
            'formatted_balance' => '$' . number_format($wallet, 2),
            'statistics' => $walletStats,
        ];

        return Inertia::render('client/dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'stats' => $stats,
            'wallet' => $walletData,
            'orders' => $orders->values(),
            'currentTab' => $tab,
        ]);
    }
}
