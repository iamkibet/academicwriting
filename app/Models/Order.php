<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'academic_level_id',
        'service_type_id',
        'deadline_type_id',
        'language_id',
        'deadline_date',
        'pages',
        'words',
        'price',
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
        ];
    }

    // Order statuses
    const STATUS_PLACED = 'placed';
    const STATUS_ACTIVE = 'active';
    const STATUS_ASSIGNED = 'assigned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_WAITING_FOR_REVIEW = 'waiting_for_review';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_IN_REVISION = 'in_revision';

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
        return $this->hasMany(OrderFile::class);
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
     * Check if order is active
     */
    public function isActive(): bool
    {
        return in_array($this->status, [
            self::STATUS_ACTIVE,
            self::STATUS_ASSIGNED,
            self::STATUS_IN_PROGRESS,
            self::STATUS_SUBMITTED,
            self::STATUS_WAITING_FOR_REVIEW,
            self::STATUS_IN_REVISION,
        ]);
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if order is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Get available statuses
     */
    public static function getAvailableStatuses(): array
    {
        return [
            self::STATUS_PLACED,
            self::STATUS_ACTIVE,
            self::STATUS_ASSIGNED,
            self::STATUS_IN_PROGRESS,
            self::STATUS_SUBMITTED,
            self::STATUS_WAITING_FOR_REVIEW,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
            self::STATUS_IN_REVISION,
        ];
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
