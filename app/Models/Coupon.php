<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_amount',
        'minimum_order_amount',
        'usage_limit',
        'used_count',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_amount' => 'decimal:2',
            'minimum_order_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the coupon usages
     */
    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Check if coupon is valid
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->starts_at && now() < $this->starts_at) {
            return false;
        }

        if ($this->expires_at && now() > $this->expires_at) {
            return false;
        }

        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Check if coupon can be used by user
     */
    public function canBeUsedBy(int $userId): bool
    {
        // Check if user has already used this coupon
        return !$this->usages()->where('user_id', $userId)->exists();
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount(float $amount): float
    {
        if ($amount < $this->minimum_order_amount) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            return round(($amount * $this->discount_amount) / 100, 2);
        }

        return min($this->discount_amount, $amount);
    }

    /**
     * Apply coupon to order
     */
    public function applyToOrder(int $userId, ?int $orderId = null, float $orderAmount = 0): CouponUsage
    {
        $discountAmount = $this->calculateDiscount($orderAmount);

        $this->increment('used_count');

        return $this->usages()->create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount,
        ]);
    }
}
