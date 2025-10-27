<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'academic_level_id',
        'paper_type',
        'discipline_id',
        'service_type_id',
        'deadline_hours',
        'language_id',
        'deadline_date',
        'pages',
        'words',
        'spacing',
        'paper_format',
        'number_of_sources',
        'price',
        'additional_features',
        'status',
        'client_id',
        'writer_id',
        'admin_notes',
        'client_notes',
        'requirements_file',
        'submitted_file',
        'final_file',
    ];

    protected function casts(): array
    {
        return [
            'deadline_date' => 'datetime',
            'price' => 'decimal:2',
            'pages' => 'integer',
            'words' => 'integer',
            'additional_features' => 'array',
            'status' => OrderStatus::class,
        ];
    }

    // Order statuses - using enum
    const STATUS_WAITING_FOR_PAYMENT = 'waiting_for_payment';
    const STATUS_WRITER_PENDING = 'writer_pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_REVIEW = 'review';
    const STATUS_APPROVAL = 'approval';

    // Academic levels
    const LEVEL_HIGH_SCHOOL = 'high_school';
    const LEVEL_COLLEGE = 'college';
    const LEVEL_GRADUATE = 'graduate';
    const LEVEL_PHD = 'phd';

    // Service types
    const TYPE_ESSAY = 'essay';
    const TYPE_RESEARCH_PAPER = 'research_paper';
    const TYPE_THESIS = 'thesis';
    const TYPE_DISSERTATION = 'dissertation';

    // Deadline types
    const DEADLINE_STANDARD = 'standard';
    const DEADLINE_RUSH = 'rush';
    const DEADLINE_ULTRA_RUSH = 'ultra_rush';

    /**
     * Get the client who placed the order
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the writer assigned to the order
     */
    public function writer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'writer_id');
    }

    /**
     * Get the academic level
     */
    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class);
    }

    /**
     * Get the service type (subject)
     */
    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'service_type_id');
    }

    public function discipline(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'discipline_id');
    }

    /**
     * Get the deadline type (order rate)
     */
    public function deadlineType(): BelongsTo
    {
        return $this->belongsTo(OrderRate::class, 'deadline_type_id');
    }

    /**
     * Get the language
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    /**
     * Get the order files
     */
    public function files(): HasMany
    {
        return $this->hasMany(OrderFile::class, 'order_id');
    }


    /**
     * Get the order messages
     */
    public function messages(): HasMany
    {
        return $this->hasMany(OrderMessage::class);
    }

    /**
     * Get the order revisions
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(OrderRevision::class);
    }

    /**
     * Get the order payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the order status history
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    /**
     * Get the inquiry this order was converted from
     */
    public function convertedFromInquiry(): HasOne
    {
        return $this->hasOne(Inquiry::class, 'converted_to_order_id');
    }

    /**
     * Check if order is active
     */
    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status->isCompleted();
    }

    /**
     * Check if order requires payment
     */
    public function requiresPayment(): bool
    {
        return $this->status->requiresPayment();
    }

    /**
     * Get the current progress stage (0-4)
     */
    public function getProgressStage(): int
    {
        return $this->status->getProgressStage();
    }

    /**
     * Get available statuses
     */
    public static function getAvailableStatuses(): array
    {
        return OrderStatus::values();
    }

    /**
     * Get status options for forms
     */
    public static function getStatusOptions(): array
    {
        return OrderStatus::options();
    }

    /**
     * Update order status with validation and history tracking
     */
    public function updateStatus(OrderStatus $newStatus, ?User $changedBy = null, ?string $notes = null): bool
    {
        if (!$this->status->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Cannot transition from {$this->status->value} to {$newStatus->value}"
            );
        }

        $previousStatus = $this->status;
        $this->status = $newStatus;
        $this->save();

        // Create status history entry
        OrderStatusHistory::createEntry(
            $this->id,
            $newStatus->value,
            $previousStatus->value,
            $changedBy?->id,
            $notes
        );

        return true;
    }

    /**
     * Get available academic levels
     */
    public static function getAcademicLevels(): array
    {
        return [
            self::LEVEL_HIGH_SCHOOL => 'High School',
            self::LEVEL_COLLEGE => 'College',
            self::LEVEL_GRADUATE => 'Graduate',
            self::LEVEL_PHD => 'PhD',
        ];
    }

    /**
     * Get available service types
     */
    public static function getServiceTypes(): array
    {
        return [
            self::TYPE_ESSAY => 'Essay',
            self::TYPE_RESEARCH_PAPER => 'Research Paper',
            self::TYPE_THESIS => 'Thesis',
            self::TYPE_DISSERTATION => 'Dissertation',
        ];
    }

    /**
     * Get available deadline types
     */
    public static function getDeadlineTypes(): array
    {
        return [
            self::DEADLINE_STANDARD => 'Standard (7+ days)',
            self::DEADLINE_RUSH => 'Rush (3-6 days)',
            self::DEADLINE_ULTRA_RUSH => 'Ultra Rush (1-2 days)',
        ];
    }
}
