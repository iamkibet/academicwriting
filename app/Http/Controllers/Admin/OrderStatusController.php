<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\BulkUpdateOrderStatusRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class OrderStatusController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    /**
     * Show the order status management page
     */
    public function index(Request $request): InertiaResponse
    {
        $status = $request->get('status');
        $query = Order::with(['client', 'writer', 'academicLevel', 'serviceType']);

        if ($status && OrderStatus::tryFrom($status)) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('admin/orders/status-management', [
            'orders' => $orders,
            'statusOptions' => Order::getStatusOptions(),
            'currentStatus' => $status,
            'statistics' => $this->orderService->getOrderStatistics(),
        ]);
    }

    /**
     * Update order status
     */
    public function update(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        try {
            $newStatus = OrderStatus::from($request->status);
            $this->orderService->updateOrderStatus(
                $order,
                $newStatus,
                $request->user(),
                $request->notes
            );

            return redirect()->back()->with('success', 'Order status updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get orders by status (API endpoint)
     */
    public function getByStatus(Request $request): InertiaResponse
    {
        $status = OrderStatus::from($request->status);
        $orders = $this->orderService->getOrdersByStatus($status)
            ->load(['client', 'writer', 'academicLevel', 'serviceType']);

        return Inertia::render('admin/orders/status-management', [
            'orders' => $orders,
            'statusOptions' => Order::getStatusOptions(),
            'currentStatus' => $status->value,
            'statistics' => $this->orderService->getOrderStatistics(),
        ]);
    }

    /**
     * Bulk update order statuses
     */
    public function bulkUpdate(BulkUpdateOrderStatusRequest $request): RedirectResponse
    {
        $newStatus = OrderStatus::from($request->status);
        $updatedCount = 0;
        $errors = [];

        foreach ($request->order_ids as $orderId) {
            try {
                $order = Order::findOrFail($orderId);
                
                // Check if transition is valid
                if (!$order->status->canTransitionTo($newStatus)) {
                    $errors[] = "Order #{$orderId}: Cannot transition from {$order->status->value} to {$newStatus->value}";
                    continue;
                }
                
                $this->orderService->updateOrderStatus(
                    $order,
                    $newStatus,
                    $request->user(),
                    $request->notes
                );
                $updatedCount++;
            } catch (\Exception $e) {
                $errors[] = "Order #{$orderId}: " . $e->getMessage();
            }
        }

        $message = "Successfully updated {$updatedCount} orders.";
        if (!empty($errors)) {
            $message .= " Errors: " . implode('; ', $errors);
        }

        return redirect()->back()->with(
            empty($errors) ? 'success' : 'warning',
            $message
        );
    }
}
