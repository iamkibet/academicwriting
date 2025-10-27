<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWebOrderRequest;
use App\Models\Order;
use App\Models\OrderFile;
use App\Models\AdditionalFeature;
use App\Enums\OrderStatus;
use App\Services\OrderService;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Inertia\ResponseFactory;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private PricingService $pricingService
    ) {}

    /**
     * Display the order placement form
     */
    public function create(): InertiaResponse
    {
        $pricingOptions = [
            'academic_levels' => $this->pricingService->getAcademicLevels(),
            'service_types' => $this->pricingService->getServiceTypes(),
            'deadline_types' => $this->pricingService->getDeadlineTypes(),
            'languages' => $this->pricingService->getLanguages(),
            'additional_features' => $this->getAdditionalFeatures(),
        ];

        return Inertia::render('orders/create', [
            'pricingOptions' => $pricingOptions,
        ]);
    }

    /**
     * Store a newly created order
     */
    public function store(StoreWebOrderRequest $request)
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return redirect()->back()->withErrors([
                'general' => 'Only clients can place orders',
            ]);
        }

        $order = $this->orderService->createOrder($request->validated(), $user);

        // Redirect to dashboard with appropriate tab based on order status
        $tab = match($order->status) {
            'waiting_for_payment' => 'recent',
            'writer_pending', 'in_progress', 'review', 'approval', 'in_revision' => 'active',
            'cancelled' => 'cancelled',
            default => 'recent'
        };

        return Inertia::location(route('dashboard.orders', ['tab' => $tab]));
    }

    /**
     * Display the specified order
     */
    public function show(Order $order, Request $request): InertiaResponse
    {
        $user = $request->user();

        // Check if user can view this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            abort(403, 'Unauthorized to view this order');
        }

        $order->load(['client', 'writer', 'payments', 'files', 'messages', 'revisions', 'statusHistory', 'academicLevel', 'serviceType', 'discipline', 'language']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Display a listing of the user's orders
     */
    public function index(Request $request): InertiaResponse
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

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filter' => $status ?? 'all',
        ]);
    }

    /**
     * Update order status (admin only)
     */
    public function updateStatus(Order $order, Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return redirect()->back()->withErrors([
                'general' => 'Only admins can update order status',
            ]);
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

        return redirect()->back()->with('success', 'Order status updated successfully');
    }

    /**
     * Accept order (admin only)
     */
    public function accept(Order $order, Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return redirect()->back()->withErrors([
                'general' => 'Only admins can accept orders',
            ]);
        }

        if ($order->status !== OrderStatus::WAITING_FOR_PAYMENT) {
            return redirect()->back()->withErrors([
                'general' => 'Order is not in waiting for payment status',
            ]);
        }

        $request->validate([
            'admin_notes' => 'nullable|string',
        ]);

        $acceptedOrder = $this->orderService->acceptOrder($order, $user, $request->admin_notes);

        return redirect()->back()->with('success', 'Order accepted successfully');
    }

    /**
     * Cancel order
     */
    public function cancel(Order $order, Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if user can cancel this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            return redirect()->back()->withErrors([
                'general' => 'Unauthorized to cancel this order',
            ]);
        }

        // Check if order can be cancelled
        if (in_array($order->status, [OrderStatus::APPROVAL, OrderStatus::CANCELLED])) {
            return redirect()->back()->withErrors([
                'general' => 'Order cannot be cancelled',
            ]);
        }

        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $cancelledOrder = $this->orderService->cancelOrder($order, $user, $request->reason);

        // Redirect to dashboard with cancelled tab
        return Inertia::location(route('dashboard.orders', ['tab' => 'cancelled']))
            ->with('success', 'Order cancelled successfully');
    }

    /**
     * Download order file
     */
    public function downloadFile(Order $order, OrderFile $file, Request $request)
    {
        $user = $request->user();

        // Check if user can download this file
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            abort(403, 'Unauthorized to download this file');
        }

        // Check if file exists
        if (!Storage::disk('private')->exists($file->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('private')->download($file->file_path, $file->file_name);
    }

    /**
     * Add services to an order
     */
    public function addServices(Order $order, Request $request)
    {
        $user = $request->user();

        // Check if user can modify this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            abort(403, 'Unauthorized to modify this order');
        }

        $request->validate([
            'services' => 'required|array|min:1',
            'services.*.service_key' => 'required|string',
            'services.*.name' => 'required|string',
            'services.*.price' => 'required|numeric|min:0',
            'services.*.quantity' => 'required|integer|min:1',
            'services.*.total_price' => 'required|numeric|min:0',
        ]);

        $services = $request->input('services');
        
        // Calculate additional pages and their cost using the exact same pricing logic
        $additionalPages = 0;
        $totalAdditionalCost = 0;
        
        foreach ($services as $service) {
            if ($service['service_key'] === 'additional_pages') {
                $additionalPages += $service['quantity'];
                // Use the exact base price per page for additional pages
                $pricingService = app(PricingService::class);
                $basePricePerPage = $pricingService->getBasePricePerPageForOrder($order);
                $serviceCost = $basePricePerPage * $service['quantity'];
                $totalAdditionalCost += $serviceCost;
                
                // Log for debugging
                \Log::info('Adding additional pages to order ' . $order->id, [
                    'quantity' => $service['quantity'],
                    'base_price_per_page' => $basePricePerPage,
                    'service_cost' => $serviceCost,
                    'total_additional_cost' => $totalAdditionalCost
                ]);
            } else {
                // For other services, use the provided price
                $totalAdditionalCost += $service['total_price'];
            }
        }

        // Update order price and pages
        $updateData = [
            'price' => $order->price + $totalAdditionalCost
        ];
        
        if ($additionalPages > 0) {
            $updateData['pages'] = $order->pages + $additionalPages;
        }
        
        $order->update($updateData);

        // Store services in order notes or create a separate table
        $existingNotes = $order->client_notes ?? '';
        $servicesText = "\n\nAdditional Services Added:\n";
        foreach ($services as $service) {
            $servicesText .= "- {$service['name']} (Qty: {$service['quantity']}) - $" . number_format($service['total_price'], 2) . "\n";
        }
        $servicesText .= "Total Additional Cost: $" . number_format($totalAdditionalCost, 2);

        $order->update([
            'client_notes' => $existingNotes . $servicesText
        ]);

        return redirect()->back()->with('success', 'Services added to order successfully!');
    }

    /**
     * Get additional features for order form
     */
    private function getAdditionalFeatures(): array
    {
        return AdditionalFeature::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->mapWithKeys(function ($feature) {
                $price = $feature->type === 'fixed' 
                    ? '$' . number_format($feature->amount, 2)
                    : '+' . $feature->amount . '%';
                
                return [
                    $feature->id => [
                        'id' => $feature->id,
                        'name' => $feature->name,
                        'description' => $feature->description,
                        'type' => $feature->type,
                        'amount' => $feature->amount,
                        'price_display' => $price,
                    ]
                ];
            })
            ->toArray();
    }

    /**
     * Get base price per page for an order
     */
    public function getBasePricePerPage(Order $order, Request $request)
    {
        $user = $request->user();

        // Check if user can view this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            abort(403, 'Unauthorized to view this order');
        }

        $pricingService = app(PricingService::class);
        $basePricePerPage = $pricingService->getBasePricePerPageForOrder($order);

        return response()->json([
            'base_price_per_page' => $basePricePerPage
        ]);
    }
}
