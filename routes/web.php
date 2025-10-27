<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminPricingController;
use App\Http\Controllers\Admin\OrderStatusController;
use App\Http\Controllers\ClientDashboardController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RewardsController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard - redirect based on user role
    Route::get('dashboard', function () {
        $user = auth()->user();
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } else {
            return redirect()->route('dashboard.orders');
        }
    })->name('dashboard');

    // Client routes - all under dashboard prefix
    Route::middleware('client')->prefix('dashboard')->name('dashboard.')->group(function () {
        // Dashboard main page
        Route::get('orders', [ClientDashboardController::class, 'orders'])->name('orders');
        
        // Inquiry routes
        Route::get('inquiries', [InquiryController::class, 'index'])->name('inquiries');
        Route::get('inquiries/create', [InquiryController::class, 'create'])->name('inquiries.create');
        Route::post('inquiries', [InquiryController::class, 'store'])->name('inquiries.store');
        Route::get('inquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
        Route::get('inquiries/{inquiry}/edit', [InquiryController::class, 'edit'])->name('inquiries.edit');
        Route::patch('inquiries/{inquiry}', [InquiryController::class, 'update'])->name('inquiries.update');
        Route::delete('inquiries/{inquiry}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');
        Route::post('inquiries/{inquiry}/convert-to-order', [InquiryController::class, 'convertToOrder'])->name('inquiries.convert-to-order');
        
        // Order routes
        Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
        Route::get('orders/{order}/files/{file}/download', [OrderController::class, 'downloadFile'])->name('orders.files.download');
        Route::post('orders/{order}/add-services', [OrderController::class, 'addServices'])->name('orders.add-services');
Route::get('orders/{order}/base-price', [OrderController::class, 'getBasePricePerPage'])->name('orders.base-price');
        
        // Wallet routes
        Route::get('wallet', [WalletController::class, 'index'])->name('wallet');
        Route::post('wallet/top-up', [WalletController::class, 'initiateTopUp'])->name('wallet.top-up');
        Route::get('wallet/paypal/success', [WalletController::class, 'paypalSuccess'])->name('wallet.paypal.success');
        Route::get('wallet/paypal/cancel', [WalletController::class, 'paypalCancel'])->name('wallet.paypal.cancel');
        
        // Rewards routes
        Route::get('rewards', [RewardsController::class, 'index'])->name('rewards');
        Route::post('rewards/validate-coupon', [RewardsController::class, 'validateCoupon'])->name('rewards.validate-coupon');
    });

    // Admin routes
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('pricing', [AdminPricingController::class, 'index'])->name('pricing');
        
        // Admin order routes
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/pending', [AdminOrderController::class, 'pending'])->name('orders.pending');
        Route::get('orders/active', [AdminOrderController::class, 'active'])->name('orders.active');
        Route::get('orders/cancelled', [AdminOrderController::class, 'cancelled'])->name('orders.cancelled');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
        Route::patch('orders/{order}/accept', [OrderController::class, 'accept'])->name('orders.accept');
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

        // Order status management routes
        Route::get('orders/status-management', [OrderStatusController::class, 'index'])->name('orders.status-management');
        Route::post('orders/status-management/{order}', [OrderStatusController::class, 'update'])->name('orders.status-management.update');
        Route::post('orders/status-management/bulk-update', [OrderStatusController::class, 'bulkUpdate'])->name('orders.status-management.bulk-update');
        Route::get('orders/status-management/by-status', [OrderStatusController::class, 'getByStatus'])->name('orders.status-management.by-status');

        // All management is now in /settings
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
