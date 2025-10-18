<?php

namespace App\Http\Controllers;

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
}
