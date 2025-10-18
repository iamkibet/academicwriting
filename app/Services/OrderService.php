<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\PricingPreset;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a new order
     */
    public function createOrder(array $data, User $client): Order
    {
        return DB::transaction(function () use ($data, $client) {
            // Calculate price using the PricingService
            $pricingService = app(PricingService::class);
            $priceEstimate = $pricingService->getPriceEstimate(
                $data['academic_level_id'],
                $data['service_type_id'],
                $data['deadline_type_id'],
                $data['language_id'],
                $data['pages']
            );

            // Create the order (using only fields that exist in the database)
            $order = Order::create([
                'title' => $data['topic'] ?? 'Writer\'s choice', // Use topic as title
                'description' => $data['description'],
                'academic_level_id' => $data['academic_level_id'],
                'service_type_id' => $data['service_type_id'],
                'deadline_type_id' => $data['deadline_type_id'],
                'language_id' => $data['language_id'],
                'deadline_date' => $data['deadline_date'],
                'pages' => $data['pages'],
                'words' => $data['words'],
                'price' => $priceEstimate['total_price'],
                'client_id' => $client->id,
                'status' => Order::STATUS_PLACED,
            ]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                Order::STATUS_PLACED,
                null,
                $client->id,
                'Order placed by client'
            );

            return $order;
        });
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Order $order, string $newStatus, ?User $changedBy = null, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $changedBy, $notes) {
            $previousStatus = $order->status;
            
            $order->update(['status' => $newStatus]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                $newStatus,
                $previousStatus,
                $changedBy?->id,
                $notes
            );

            return $order->fresh();
        });
    }

    /**
     * Accept order (admin action)
     */
    public function acceptOrder(Order $order, User $admin, ?string $adminNotes = null): Order
    {
        return DB::transaction(function () use ($order, $admin, $adminNotes) {
            $order->update([
                'status' => Order::STATUS_ACTIVE,
                'admin_notes' => $adminNotes,
            ]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                Order::STATUS_ACTIVE,
                Order::STATUS_PLACED,
                $admin->id,
                'Order accepted by admin'
            );

            return $order->fresh();
        });
    }

    /**
     * Assign order to writer
     */
    public function assignOrder(Order $order, User $writer, User $admin): Order
    {
        return DB::transaction(function () use ($order, $writer, $admin) {
            $order->update([
                'status' => Order::STATUS_ASSIGNED,
                'writer_id' => $writer->id,
            ]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                Order::STATUS_ASSIGNED,
                Order::STATUS_ACTIVE,
                $admin->id,
                "Order assigned to writer: {$writer->name}"
            );

            return $order->fresh();
        });
    }

    /**
     * Cancel order
     */
    public function cancelOrder(Order $order, User $cancelledBy, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $cancelledBy, $reason) {
            $order->update(['status' => Order::STATUS_CANCELLED]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                Order::STATUS_CANCELLED,
                $order->status,
                $cancelledBy->id,
                $reason ?? 'Order cancelled'
            );

            return $order->fresh();
        });
    }

    /**
     * Complete order
     */
    public function completeOrder(Order $order, User $completedBy, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($order, $completedBy, $notes) {
            $order->update(['status' => Order::STATUS_COMPLETED]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                Order::STATUS_COMPLETED,
                $order->status,
                $completedBy->id,
                $notes ?? 'Order completed'
            );

            return $order->fresh();
        });
    }

    /**
     * Calculate order price based on pricing presets
     */
    public function calculatePrice(string $academicLevel, string $serviceType, string $deadlineType, int $pages): float
    {
        return PricingPreset::calculatePrice($academicLevel, $serviceType, $deadlineType, $pages);
    }

    /**
     * Get orders for client
     */
    public function getClientOrders(User $client, ?string $status = null)
    {
        $query = $client->clientOrders()->with(['writer', 'payments']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get orders for admin
     */
    public function getAdminOrders(?string $status = null)
    {
        $query = Order::with(['client', 'writer', 'payments']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get pending orders (awaiting admin acceptance)
     */
    public function getPendingOrders()
    {
        return Order::where('status', Order::STATUS_PLACED)
            ->with(['client', 'payments'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get active orders (accepted but not completed)
     */
    public function getActiveOrders()
    {
        return Order::whereIn('status', [
            Order::STATUS_ACTIVE,
            Order::STATUS_ASSIGNED,
            Order::STATUS_IN_PROGRESS,
            Order::STATUS_SUBMITTED,
            Order::STATUS_WAITING_FOR_REVIEW,
            Order::STATUS_IN_REVISION,
        ])
        ->with(['client', 'writer', 'payments'])
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Get order statistics
     */
    public function getOrderStatistics(): array
    {
        return [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', Order::STATUS_PLACED)->count(),
            'active_orders' => Order::whereIn('status', [
                Order::STATUS_ACTIVE,
                Order::STATUS_ASSIGNED,
                Order::STATUS_IN_PROGRESS,
                Order::STATUS_SUBMITTED,
                Order::STATUS_WAITING_FOR_REVIEW,
                Order::STATUS_IN_REVISION,
            ])->count(),
            'completed_orders' => Order::where('status', Order::STATUS_COMPLETED)->count(),
            'cancelled_orders' => Order::where('status', Order::STATUS_CANCELLED)->count(),
            'total_revenue' => Order::where('status', Order::STATUS_COMPLETED)->sum('price'),
        ];
    }
}
