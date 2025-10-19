<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminPricingController;
use App\Http\Controllers\ClientDashboardController;
use App\Http\Controllers\OrderController;
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
        
        // Order routes
        Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
        
        // Wallet routes
        Route::get('wallet', [WalletController::class, 'index'])->name('wallet');
    });

    // Admin routes
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('pricing', [AdminPricingController::class, 'index'])->name('pricing');
        
        // Admin order routes
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/pending', [AdminOrderController::class, 'pending'])->name('orders.pending');
        Route::get('orders/active', [AdminOrderController::class, 'active'])->name('orders.active');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
        Route::patch('orders/{order}/accept', [OrderController::class, 'accept'])->name('orders.accept');
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

        // All management is now in /settings
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
