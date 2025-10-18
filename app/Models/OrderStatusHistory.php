<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'order_status_history';

    protected $fillable = [
        'order_id',
        'status',
        'previous_status',
        'changed_by_user_id',
        'notes',
    ];

    /**
     * Get the order that owns this status history
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who changed the status
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    /**
     * Create a new status history entry
     */
    public static function createEntry(
        int $orderId,
        string $status,
        ?string $previousStatus = null,
        ?int $changedByUserId = null,
        ?string $notes = null
    ): self {
        return self::create([
            'order_id' => $orderId,
            'status' => $status,
            'previous_status' => $previousStatus,
            'changed_by_user_id' => $changedByUserId,
            'notes' => $notes,
        ]);
    }
}
