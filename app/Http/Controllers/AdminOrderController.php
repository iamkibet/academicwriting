<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    /**
     * Display a listing of orders for admin
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            abort(403, 'Only admins can access this page');
        }

        $status = $request->query('status');
        $orders = $status ? 
            $this->orderService->getAdminOrders($status) : 
            $this->orderService->getAdminOrders();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filter' => $status ?? 'all',
        ]);
    }

    /**
     * Display pending orders
     */
    public function pending(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            abort(403, 'Only admins can access this page');
        }

        $orders = $this->orderService->getPendingOrders();

        return Inertia::render('admin/orders/pending', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display active orders
     */
    public function active(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            abort(403, 'Only admins can access this page');
        }

        $orders = $this->orderService->getActiveOrders();

        return Inertia::render('admin/orders/active', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display cancelled orders
     */
    public function cancelled(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            abort(403, 'Only admins can access this page');
        }

        $orders = Order::where('status', OrderStatus::CANCELLED)
            ->with(['client', 'writer', 'academicLevel', 'serviceType'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Calculate statistics
        $statistics = [
            'total_cancelled' => Order::where('status', OrderStatus::CANCELLED)->count(),
            'cancelled_this_month' => Order::where('status', OrderStatus::CANCELLED)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'cancelled_this_week' => Order::where('status', OrderStatus::CANCELLED)
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'total_lost_revenue' => Order::where('status', OrderStatus::CANCELLED)->sum('price'),
        ];

        return Inertia::render('admin/orders/cancelled', [
            'orders' => $orders,
            'statistics' => $statistics,
        ]);
    }
}
