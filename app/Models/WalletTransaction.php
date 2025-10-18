<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'description',
        'order_id',
        'payment_method',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    // Transaction types
    const TYPE_CREDIT = 'credit';
    const TYPE_DEBIT = 'debit';

    // Payment methods
    const PAYMENT_WALLET = 'wallet';
    const PAYMENT_PAYPAL = 'paypal';
    const PAYMENT_HYBRID = 'hybrid';
    const PAYMENT_REFUND = 'refund';

    // Transaction statuses
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the wallet that owns this transaction
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Get the order associated with this transaction
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        $sign = $this->type === self::TYPE_CREDIT ? '+' : '-';
        return $sign . '$' . number_format($this->amount, 2);
    }

    /**
     * Get available transaction types
     */
    public static function getTransactionTypes(): array
    {
        return [
            self::TYPE_CREDIT => 'Credit',
            self::TYPE_DEBIT => 'Debit',
        ];
    }

    /**
     * Get available payment methods
     */
    public static function getPaymentMethods(): array
    {
        return [
            self::PAYMENT_WALLET => 'Wallet',
            self::PAYMENT_PAYPAL => 'PayPal',
            self::PAYMENT_HYBRID => 'Wallet + PayPal',
            self::PAYMENT_REFUND => 'Refund',
        ];
    }

    /**
     * Get available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
    }
}
