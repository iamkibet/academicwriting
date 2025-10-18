<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class WalletService
{
    /**
     * Create wallet for user
     */
    public function createWallet(User $user): Wallet
    {
        return DB::transaction(function () use ($user) {
            if ($user->wallet) {
                return $user->wallet;
            }

            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0.00,
            ]);

            return $wallet;
        });
    }

    /**
     * Top up wallet with PayPal
     */
    public function topUpWallet(User $user, float $amount, string $paypalTransactionId): array
    {
        return DB::transaction(function () use ($user, $amount, $paypalTransactionId) {
            $wallet = $user->getOrCreateWallet();

            // Add funds to wallet
            $transaction = $wallet->addFunds(
                $amount,
                "Wallet top-up via PayPal",
                null,
                WalletTransaction::PAYMENT_PAYPAL
            );

            return [
                'success' => true,
                'message' => 'Wallet topped up successfully',
                'amount' => $amount,
                'new_balance' => $wallet->fresh()->balance,
                'transaction' => $transaction,
            ];
        });
    }

    /**
     * Get wallet balance
     */
    public function getWalletBalance(User $user): float
    {
        $wallet = $user->getOrCreateWallet();
        return $wallet->balance;
    }

    /**
     * Get wallet transactions
     */
    public function getWalletTransactions(User $user, int $limit = 50)
    {
        $wallet = $user->getOrCreateWallet();
        
        return $wallet->transactions()
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get wallet statistics
     */
    public function getWalletStatistics(User $user): array
    {
        $wallet = $user->getOrCreateWallet();
        
        $transactions = $wallet->transactions();
        
        return [
            'current_balance' => $wallet->balance,
            'total_credits' => $transactions->where('type', WalletTransaction::TYPE_CREDIT)->sum('amount'),
            'total_debits' => $transactions->where('type', WalletTransaction::TYPE_DEBIT)->sum('amount'),
            'total_transactions' => $transactions->count(),
            'credit_transactions' => $transactions->where('type', WalletTransaction::TYPE_CREDIT)->count(),
            'debit_transactions' => $transactions->where('type', WalletTransaction::TYPE_DEBIT)->count(),
        ];
    }

    /**
     * Get all wallet statistics (admin)
     */
    public function getAllWalletStatistics(): array
    {
        $totalWallets = Wallet::count();
        $totalBalance = Wallet::sum('balance');
        $totalTransactions = WalletTransaction::count();

        return [
            'total_wallets' => $totalWallets,
            'total_balance' => $totalBalance,
            'total_transactions' => $totalTransactions,
            'average_balance' => $totalWallets > 0 ? $totalBalance / $totalWallets : 0,
            'total_credits' => WalletTransaction::where('type', WalletTransaction::TYPE_CREDIT)->sum('amount'),
            'total_debits' => WalletTransaction::where('type', WalletTransaction::TYPE_DEBIT)->sum('amount'),
        ];
    }

    /**
     * Get wallet usage by payment method
     */
    public function getWalletUsageByPaymentMethod(): array
    {
        return WalletTransaction::selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->where('type', WalletTransaction::TYPE_CREDIT)
            ->groupBy('payment_method')
            ->get()
            ->toArray();
    }

    /**
     * Check if user can afford amount
     */
    public function canAfford(User $user, float $amount): bool
    {
        $wallet = $user->getOrCreateWallet();
        return $wallet->hasSufficientFunds($amount);
    }

    /**
     * Get payment options for user
     */
    public function getPaymentOptions(User $user, float $orderAmount): array
    {
        $wallet = $user->getOrCreateWallet();
        $walletBalance = $wallet->balance;

        $options = [];

        // Full wallet payment
        if ($walletBalance >= $orderAmount) {
            $options[] = [
                'type' => 'wallet_full',
                'label' => 'Pay with Wallet',
                'amount' => $orderAmount,
                'wallet_amount' => $orderAmount,
                'paypal_amount' => 0,
                'available' => true,
            ];
        }

        // Partial wallet + PayPal
        if ($walletBalance > 0 && $walletBalance < $orderAmount) {
            $paypalAmount = $orderAmount - $walletBalance;
            $options[] = [
                'type' => 'hybrid',
                'label' => "Pay {$walletBalance} with Wallet + {$paypalAmount} via PayPal",
                'amount' => $orderAmount,
                'wallet_amount' => $walletBalance,
                'paypal_amount' => $paypalAmount,
                'available' => true,
            ];
        }

        // PayPal only
        $options[] = [
            'type' => 'paypal_full',
            'label' => 'Pay via PayPal',
            'amount' => $orderAmount,
            'wallet_amount' => 0,
            'paypal_amount' => $orderAmount,
            'available' => true,
        ];

        return $options;
    }
}
