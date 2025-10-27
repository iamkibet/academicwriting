<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a client
     */
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get orders placed by this client
     */
    public function clientOrders()
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    /**
     * Get orders assigned to this writer
     */
    public function writerOrders()
    {
        return $this->hasMany(Order::class, 'writer_id');
    }

    /**
     * Get user's wallet
     */
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Get user's payments
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get user's order messages
     */
    public function orderMessages()
    {
        return $this->hasMany(OrderMessage::class);
    }

    /**
     * Get user's order revisions
     */
    public function requestedRevisions()
    {
        return $this->hasMany(OrderRevision::class, 'requested_by_user_id');
    }

    /**
     * Get user's status history changes
     */
    public function statusHistoryChanges()
    {
        return $this->hasMany(OrderStatusHistory::class, 'changed_by_user_id');
    }

    /**
     * Get user's inquiries
     */
    public function inquiries()
    {
        return $this->hasMany(Inquiry::class, 'client_id');
    }

    /**
     * Get user's reward account
     */
    public function reward()
    {
        return $this->hasOne(Reward::class);
    }

    /**
     * Get user's coupon usages
     */
    public function couponUsages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Get total spending for loyalty tiers
     */
    public function getTotalSpending(): float
    {
        return $this->clientOrders()
            ->where('status', \App\Enums\OrderStatus::APPROVAL->value)
            ->sum('price');
    }

    /**
     * Get loyalty discount percentage based on spending
     */
    public function getLoyaltyDiscount(): int
    {
        $totalSpending = $this->getTotalSpending();

        if ($totalSpending >= 2000) {
            return 15;
        } elseif ($totalSpending >= 1000) {
            return 10;
        } elseif ($totalSpending >= 500) {
            return 5;
        }

        return 0;
    }

    /**
     * Get or create user's wallet
     */
    public function getOrCreateWallet(): Wallet
    {
        if (!$this->wallet) {
            $this->wallet()->create(['balance' => 0.00]);
            $this->load('wallet');
        }
        
        return $this->wallet;
    }

    /**
     * Get or create user's reward account
     */
    public function getOrCreateReward(): Reward
    {
        if (!$this->reward) {
            $this->reward()->create([
                'points' => 0,
                'total_points_earned' => 0,
                'total_points_redeemed' => 0,
            ]);
            $this->load('reward');
        }
        
        return $this->reward;
    }
}
