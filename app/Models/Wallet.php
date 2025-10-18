<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
        ];
    }

    /**
     * Get the user who owns the wallet
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the wallet transactions
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Add funds to wallet
     */
    public function addFunds(float $amount, string $description, ?int $orderId = null): WalletTransaction
    {
        $this->increment('balance', $amount);
        
        return $this->transactions()->create([
            'type' => 'credit',
            'amount' => $amount,
            'description' => $description,
            'order_id' => $orderId,
            'status' => 'completed',
        ]);
    }

    /**
     * Deduct funds from wallet
     */
    public function deductFunds(float $amount, string $description, ?int $orderId = null): ?WalletTransaction
    {
        if ($this->balance < $amount) {
            return null; // Insufficient funds
        }

        $this->decrement('balance', $amount);
        
        return $this->transactions()->create([
            'type' => 'debit',
            'amount' => $amount,
            'description' => $description,
            'order_id' => $orderId,
            'status' => 'completed',
        ]);
    }

    /**
     * Check if wallet has sufficient funds
     */
    public function hasSufficientFunds(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Get wallet balance formatted
     */
    public function getFormattedBalanceAttribute(): string
    {
        return '$' . number_format($this->balance, 2);
    }
}
