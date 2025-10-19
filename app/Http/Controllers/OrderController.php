<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWebOrderRequest;
use App\Models\Order;
use App\Models\AdditionalFeature;
use App\Services\OrderService;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
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
    public function create(): Response
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
            'placed' => 'active',
            'active', 'assigned', 'in_progress', 'submitted', 'waiting_for_review', 'in_revision' => 'active',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            default => 'recent'
        };

        return Inertia::location(route('dashboard.orders', ['tab' => $tab]));
    }

    /**
     * Display the specified order
     */
    public function show(Order $order, Request $request): Response
    {
        $user = $request->user();

        // Check if user can view this order
        if (!$user->isAdmin() && $order->client_id !== $user->id) {
            abort(403, 'Unauthorized to view this order');
        }

        $order->load(['client', 'writer', 'payments', 'files', 'messages', 'revisions', 'statusHistory']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Display a listing of the user's orders
     */
    public function index(Request $request): Response
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

        if ($order->status !== Order::STATUS_PLACED) {
            return redirect()->back()->withErrors([
                'general' => 'Order is not in placed status',
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
        if (in_array($order->status, [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED])) {
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
}
