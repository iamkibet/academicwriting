<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private PaymentService $paymentService
    ) {}

    /**
     * Get orders for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->query('status');

        if ($user->isAdmin()) {
            $orders = $status ? 
                $this->orderService->getAdminOrders($status) : 
                $this->orderService->getAdminOrders();
        } else {
            $orders = $this->orderService->getClientOrders($user, $status);
        }

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a new order
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can place orders',
            ], 403);
        }

        $order = $this->orderService->createOrder($request->validated(), $user);

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully',
            'data' => $order,
        ], 201);
    }

    /**
     * Get a specific order
     */
    public function show(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user can view this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this order',
            ], 403);
        }

        $order->load(['client', 'writer', 'payments', 'files', 'messages', 'revisions', 'statusHistory']);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status (admin only)
     */
    public function updateStatus(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can update order status',
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:' . implode(',', Order::getAvailableStatuses()),
            'notes' => 'nullable|string',
        ]);

        $updatedOrder = $this->orderService->updateOrderStatus(
            $order,
            $request->status,
            $user,
            $request->notes
        );

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $updatedOrder,
        ]);
    }

    /**
     * Accept order (admin only)
     */
    public function accept(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can accept orders',
            ], 403);
        }

        if ($order->status !== Order::STATUS_PLACED) {
            return response()->json([
                'success' => false,
                'message' => 'Order is not in placed status',
            ], 400);
        }

        $request->validate([
            'admin_notes' => 'nullable|string',
        ]);

        $acceptedOrder = $this->orderService->acceptOrder($order, $user, $request->admin_notes);

        return response()->json([
            'success' => true,
            'message' => 'Order accepted successfully',
            'data' => $acceptedOrder,
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user can cancel this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to cancel this order',
            ], 403);
        }

        // Check if order can be cancelled
        if (in_array($order->status, [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled',
            ], 400);
        }

        $request->validate([
            'reason' => 'nullable|string',
        ]);

        // Process cancellation refund if payment was made
        if ($order->status !== Order::STATUS_PLACED) {
            $refundResult = $this->paymentService->processOrderCancellation($order);
            
            if (!$refundResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process refund: ' . $refundResult['message'],
                ], 400);
            }
        }

        $cancelledOrder = $this->orderService->cancelOrder($order, $user, $request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => $cancelledOrder,
        ]);
    }

    /**
     * Get order statistics (admin only)
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view statistics',
            ], 403);
        }

        $stats = $this->orderService->getOrderStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get pending orders (admin only)
     */
    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view pending orders',
            ], 403);
        }

        $orders = $this->orderService->getPendingOrders();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get active orders (admin only)
     */
    public function active(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view active orders',
            ], 403);
        }

        $orders = $this->orderService->getActiveOrders();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
}
