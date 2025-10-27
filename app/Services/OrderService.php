<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderFile;
use App\Models\OrderStatusHistory;
use App\Models\PricingPreset;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            $additionalFeatures = is_string($data['additional_features'] ?? []) 
                ? json_decode($data['additional_features'], true) ?? []
                : ($data['additional_features'] ?? []);
                
            $priceEstimate = $pricingService->getPriceEstimate(
                $data['academic_level_id'],
                $data['service_type_id'],
                $data['deadline_hours'],
                $data['language_id'],
                $data['pages'],
                $additionalFeatures
            );

            // Calculate words based on pages and spacing
            $wordsPerPage = ($data['spacing'] ?? 'double') === 'single' ? 500 : 250;
            $calculatedWords = $data['pages'] * $wordsPerPage;

            $order = Order::create([
                'title' => $data['topic'] ?? 'Writer\'s choice', // Use topic as title
                'description' => $data['description'],
                'academic_level_id' => $data['academic_level_id'],
                'paper_type' => $data['paper_type'] ?? null,
                'discipline_id' => $data['discipline_id'] ?? $data['service_type_id'], // Use discipline_id or fallback to service_type_id
                'service_type_id' => $data['service_type_id'],
                'deadline_hours' => $data['deadline_hours'], // Use deadline_hours directly
                'language_id' => $data['language_id'],
                'deadline_date' => $data['deadline_date'],
                'pages' => $data['pages'],
                'words' => $calculatedWords, // Use calculated words
                'spacing' => $data['spacing'] ?? 'double',
                'paper_format' => $data['paper_format'] ?? 'APA',
                'number_of_sources' => $data['number_of_sources'] ?? 2,
                'price' => $priceEstimate['total_price'],
                'additional_features' => $this->processAdditionalFeatures($additionalFeatures),
                'client_id' => $client->id,
                'status' => OrderStatus::WAITING_FOR_PAYMENT,
            ]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                OrderStatus::WAITING_FOR_PAYMENT->value,
                null,
                $client->id,
                'Order placed by client'
            );

            // Handle file uploads if present
            if (isset($data['attachments']) && is_array($data['attachments'])) {
                $this->handleFileUploads($order, $data['attachments'], $data['attachment_descriptions'] ?? [], $client);
            }

            return $order;
        });
    }

    /**
     * Update order status with validation and history tracking
     */
    public function updateOrderStatus(Order $order, OrderStatus $newStatus, ?User $changedBy = null, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $changedBy, $notes) {
            $previousStatus = $order->status;
            
            // Validate status transition
            if (!$order->status->canTransitionTo($newStatus)) {
                throw new \InvalidArgumentException(
                    "Cannot transition from {$order->status->value} to {$newStatus->value}"
                );
            }
            
            $order->update(['status' => $newStatus]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                $newStatus->value,
                $previousStatus->value,
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
                'status' => OrderStatus::WRITER_PENDING,
                'admin_notes' => $adminNotes,
            ]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                OrderStatus::WRITER_PENDING->value,
                OrderStatus::WAITING_FOR_PAYMENT->value,
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
                'status' => OrderStatus::IN_PROGRESS,
                'writer_id' => $writer->id,
            ]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                OrderStatus::IN_PROGRESS->value,
                OrderStatus::WRITER_PENDING->value,
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
            $order->update(['status' => OrderStatus::CANCELLED]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                OrderStatus::CANCELLED->value,
                $order->status->value,
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
            $order->update(['status' => OrderStatus::APPROVAL]);

            // Create status history entry
            OrderStatusHistory::createEntry(
                $order->id,
                OrderStatus::APPROVAL->value,
                $order->status->value,
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
        $query = $client->clientOrders()->with(['writer', 'payments', 'academicLevel', 'serviceType', 'discipline', 'language']);

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
        $query = Order::with(['client', 'writer', 'payments', 'academicLevel', 'serviceType', 'discipline', 'language']);

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
        return Order::where('status', OrderStatus::WAITING_FOR_PAYMENT)
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
            OrderStatus::WRITER_PENDING,
            OrderStatus::IN_PROGRESS,
            OrderStatus::REVIEW,
            OrderStatus::APPROVAL,
            OrderStatus::IN_REVISION,
        ])
        ->with(['client', 'writer', 'payments'])
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Process additional features to include details
     */
    private function processAdditionalFeatures(array $featureIds): array
    {
        if (empty($featureIds)) {
            return [];
        }

        $features = [];
        foreach ($featureIds as $featureId) {
            $feature = \App\Models\AdditionalFeature::find($featureId);
            if ($feature && $feature->is_active) {
                $features[] = [
                    'id' => $feature->id,
                    'name' => $feature->name,
                    'type' => $feature->type,
                    'amount' => $feature->amount,
                    'description' => $feature->description,
                ];
            }
        }

        return $features;
    }

    /**
     * Handle file uploads for an order
     */
    private function handleFileUploads(Order $order, array $attachments, array $descriptions, User $client): void
    {
        foreach ($attachments as $index => $file) {
            if ($file && $file->isValid()) {
                // Generate unique filename
                $filename = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('orders/' . $order->id, $filename, 'private');
                
                // Get file info
                $fileSize = $file->getSize();
                $fileType = $file->getClientMimeType();
                $originalName = $file->getClientOriginalName();
                
                // Get description for this file
                $description = $descriptions[$index] ?? '';
                
                // Create order file record
                OrderFile::create([
                    'order_id' => $order->id,
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                    'file_size' => $fileSize,
                    'uploaded_by_user_id' => $client->id,
                    'file_category' => OrderFile::CATEGORY_REQUIREMENTS,
                ]);
            }
        }
    }

    /**
     * Get order statistics
     */
    public function getOrderStatistics(): array
    {
        return [
            'total_orders' => Order::count(),
            'waiting_for_payment' => Order::where('status', OrderStatus::WAITING_FOR_PAYMENT)->count(),
            'writer_pending' => Order::where('status', OrderStatus::WRITER_PENDING)->count(),
            'in_progress' => Order::where('status', OrderStatus::IN_PROGRESS)->count(),
            'review' => Order::where('status', OrderStatus::REVIEW)->count(),
            'approval' => Order::where('status', OrderStatus::APPROVAL)->count(),
            'total_revenue' => Order::where('status', OrderStatus::APPROVAL)->sum('price'),
        ];
    }


    /**
     * Get orders by status
     */
    public function getOrdersByStatus(OrderStatus $status): \Illuminate\Database\Eloquent\Collection
    {
        return Order::where('status', $status)->get();
    }

    /**
     * Get orders requiring payment
     */
    public function getOrdersRequiringPayment(): \Illuminate\Database\Eloquent\Collection
    {
        return Order::where('status', OrderStatus::WAITING_FOR_PAYMENT)->get();
    }

}
