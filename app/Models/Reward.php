<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reward extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'points',
        'total_points_earned',
        'total_points_redeemed',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'total_points_earned' => 'integer',
            'total_points_redeemed' => 'integer',
        ];
    }

    /**
     * Get the user who owns the reward
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reward transactions
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(RewardTransaction::class, 'user_id', 'user_id');
    }

    /**
     * Add points to user
     */
    public function addPoints(int $points, string $description, string $sourceType = 'other', ?int $sourceId = null, ?\DateTime $expiresAt = null): RewardTransaction
    {
        $this->increment('points', $points);
        $this->increment('total_points_earned', $points);
        
        return $this->transactions()->create([
            'type' => 'earned',
            'points' => $points,
            'description' => $description,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'expires_at' => $expiresAt,
            'user_id' => $this->user_id,
        ]);
    }

    /**
     * Redeem points
     */
    public function redeemPoints(int $points, string $description): ?RewardTransaction
    {
        if ($this->points < $points) {
            return null; // Insufficient points
        }

        $this->decrement('points', $points);
        $this->increment('total_points_redeemed', $points);
        
        return $this->transactions()->create([
            'type' => 'redeemed',
            'points' => $points,
            'description' => $description,
            'user_id' => $this->user_id,
        ]);
    }

    /**
     * Check if user has enough points
     */
    public function hasEnoughPoints(int $points): bool
    {
        return $this->points >= $points;
    }
}
