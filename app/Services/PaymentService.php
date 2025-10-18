<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Process order payment
     */
    public function processOrderPayment(Order $order, string $paymentMethod, array $additionalData = []): Payment
    {
        return DB::transaction(function () use ($order, $paymentMethod, $additionalData) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->client_id,
                'amount' => $order->price,
                'payment_method' => $paymentMethod,
                'paypal_transaction_id' => $additionalData['paypal_transaction_id'] ?? null,
                'status' => Payment::STATUS_PENDING,
                'metadata' => $additionalData['metadata'] ?? [],
            ]);

            return $payment;
        });
    }

    /**
     * Pay with wallet
     */
    public function payWithWallet(Order $order): array
    {
        return DB::transaction(function () use ($order) {
            $client = $order->client;
            $wallet = $client->getOrCreateWallet();

            // Check if client has sufficient funds
            if (!$wallet->hasSufficientFunds($order->price)) {
                return [
                    'success' => false,
                    'message' => 'Insufficient wallet balance',
                    'required_amount' => $order->price,
                    'available_amount' => $wallet->balance,
                ];
            }

            // Deduct funds from wallet
            $transaction = $wallet->deductFunds(
                $order->price,
                "Payment for order #{$order->id}",
                $order->id
            );

            if (!$transaction) {
                return [
                    'success' => false,
                    'message' => 'Failed to process wallet payment',
                ];
            }

            // Create payment record
            $payment = $this->processOrderPayment($order, Payment::METHOD_WALLET);
            $payment->update(['status' => Payment::STATUS_COMPLETED]);

            // Update order status to active
            $order->update(['status' => Order::STATUS_ACTIVE]);

            return [
                'success' => true,
                'message' => 'Payment processed successfully',
                'payment' => $payment,
                'wallet_transaction' => $transaction,
            ];
        });
    }

    /**
     * Pay with PayPal (placeholder for actual PayPal integration)
     */
    public function payWithPayPal(Order $order, string $paypalTransactionId): array
    {
        return DB::transaction(function () use ($order, $paypalTransactionId) {
            // Create payment record
            $payment = $this->processOrderPayment($order, Payment::METHOD_PAYPAL, [
                'paypal_transaction_id' => $paypalTransactionId,
                'metadata' => [
                    'paypal_transaction_id' => $paypalTransactionId,
                    'processed_at' => now()->toISOString(),
                ],
            ]);

            // For now, we'll automatically mark PayPal payments as completed
            // In a real implementation, this would be handled by PayPal webhooks
            $payment->update(['status' => Payment::STATUS_COMPLETED]);

            // Update order status to active
            $order->update(['status' => Order::STATUS_ACTIVE]);

            return [
                'success' => true,
                'message' => 'PayPal payment processed successfully',
                'payment' => $payment,
            ];
        });
    }

    /**
     * Pay with hybrid method (wallet + PayPal)
     */
    public function payWithHybrid(Order $order, float $walletAmount, string $paypalTransactionId): array
    {
        return DB::transaction(function () use ($order, $walletAmount, $paypalTransactionId) {
            $client = $order->client;
            $wallet = $client->getOrCreateWallet();
            $paypalAmount = $order->price - $walletAmount;

            // Check if client has sufficient wallet funds
            if (!$wallet->hasSufficientFunds($walletAmount)) {
                return [
                    'success' => false,
                    'message' => 'Insufficient wallet balance for hybrid payment',
                    'required_wallet_amount' => $walletAmount,
                    'available_wallet_amount' => $wallet->balance,
                ];
            }

            // Deduct wallet funds
            $walletTransaction = $wallet->deductFunds(
                $walletAmount,
                "Hybrid payment for order #{$order->id} (wallet portion)",
                $order->id
            );

            if (!$walletTransaction) {
                return [
                    'success' => false,
                    'message' => 'Failed to process wallet portion of hybrid payment',
                ];
            }

            // Create payment record
            $payment = $this->processOrderPayment($order, Payment::METHOD_HYBRID, [
                'paypal_transaction_id' => $paypalTransactionId,
                'metadata' => [
                    'wallet_amount' => $walletAmount,
                    'paypal_amount' => $paypalAmount,
                    'paypal_transaction_id' => $paypalTransactionId,
                    'processed_at' => now()->toISOString(),
                ],
            ]);

            // Mark payment as completed
            $payment->update(['status' => Payment::STATUS_COMPLETED]);

            // Update order status to active
            $order->update(['status' => Order::STATUS_ACTIVE]);

            return [
                'success' => true,
                'message' => 'Hybrid payment processed successfully',
                'payment' => $payment,
                'wallet_transaction' => $walletTransaction,
            ];
        });
    }

    /**
     * Process order cancellation refund
     */
    public function processOrderCancellation(Order $order): array
    {
        return DB::transaction(function () use ($order) {
            $payment = $order->payments()->where('status', Payment::STATUS_COMPLETED)->first();

            if (!$payment) {
                return [
                    'success' => false,
                    'message' => 'No completed payment found for this order',
                ];
            }

            // Add refund to client's wallet
            $client = $order->client;
            $wallet = $client->getOrCreateWallet();

            $transaction = $wallet->addFunds(
                $order->price,
                "Refund for cancelled order #{$order->id}",
                $order->id
            );

            // Update payment status
            $payment->update(['status' => Payment::STATUS_REFUNDED]);

            return [
                'success' => true,
                'message' => 'Order cancelled and refund processed',
                'refund_amount' => $order->price,
                'wallet_transaction' => $transaction,
            ];
        });
    }

    /**
     * Get payment statistics
     */
    public function getPaymentStatistics(): array
    {
        return [
            'total_payments' => Payment::count(),
            'completed_payments' => Payment::where('status', Payment::STATUS_COMPLETED)->count(),
            'pending_payments' => Payment::where('status', Payment::STATUS_PENDING)->count(),
            'failed_payments' => Payment::where('status', Payment::STATUS_FAILED)->count(),
            'refunded_payments' => Payment::where('status', Payment::STATUS_REFUNDED)->count(),
            'total_revenue' => Payment::where('status', Payment::STATUS_COMPLETED)->sum('amount'),
            'total_refunds' => Payment::where('status', Payment::STATUS_REFUNDED)->sum('amount'),
            'net_revenue' => Payment::where('status', Payment::STATUS_COMPLETED)->sum('amount') - 
                            Payment::where('status', Payment::STATUS_REFUNDED)->sum('amount'),
        ];
    }

    /**
     * Get payments by method
     */
    public function getPaymentsByMethod(): array
    {
        return Payment::selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->where('status', Payment::STATUS_COMPLETED)
            ->groupBy('payment_method')
            ->get()
            ->toArray();
    }
}
