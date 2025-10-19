<?php

use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public pricing endpoints
Route::get('/pricing/matrix', [PricingController::class, 'matrix']);
Route::get('/pricing/estimate', [PricingController::class, 'estimate']);
Route::get('/pricing/options', [PricingController::class, 'options']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Order routes (excluding store method which is handled by web routes)
    Route::apiResource('orders', OrderController::class)->except(['store'])->names([
        'index' => 'api.orders.index',
        'show' => 'api.orders.show',
        'update' => 'api.orders.update',
        'destroy' => 'api.orders.destroy'
    ]);
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::patch('orders/{order}/accept', [OrderController::class, 'accept']);
    Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel']);
    
    // Admin-only order routes
    Route::middleware('admin')->group(function () {
        Route::get('orders/statistics', [OrderController::class, 'statistics']);
        Route::get('orders/pending', [OrderController::class, 'pending']);
        Route::get('orders/active', [OrderController::class, 'active']);
    });

    // Payment routes
    Route::get('orders/{order}/payment-options', [PaymentController::class, 'getPaymentOptions']);
    Route::post('orders/{order}/pay/wallet', [PaymentController::class, 'payWithWallet']);
    Route::post('orders/{order}/pay/paypal', [PaymentController::class, 'payWithPayPal']);
    Route::post('orders/{order}/pay/hybrid', [PaymentController::class, 'payWithHybrid']);
    
    // Admin-only payment routes
    Route::middleware('admin')->group(function () {
        Route::get('payments/statistics', [PaymentController::class, 'statistics']);
    });

    // Wallet routes
    Route::get('wallet', [WalletController::class, 'show']);
    Route::get('wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('wallet/top-up', [WalletController::class, 'topUp']);
    
    // Admin-only wallet routes
    Route::middleware('admin')->group(function () {
        Route::get('wallet/statistics', [WalletController::class, 'statistics']);
        Route::get('pricing/presets', [PricingController::class, 'presets']);
    });
});
