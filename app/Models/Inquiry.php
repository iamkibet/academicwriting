<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
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
        'estimated_price',
        'additional_features',
        'client_notes',
        'status',
        'submitted_at',
        'converted_at',
        'converted_to_order_id',
    ];

    protected function casts(): array
    {
        return [
            'deadline_date' => 'datetime',
            'submitted_at' => 'datetime',
            'converted_at' => 'datetime',
            'estimated_price' => 'decimal:2',
            'pages' => 'integer',
            'words' => 'integer',
            'number_of_sources' => 'integer',
            'deadline_hours' => 'integer',
            'additional_features' => 'array',
        ];
    }

    // Inquiry statuses
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_CONVERTED = 'converted';

    /**
     * Get the client who created the inquiry
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the order this inquiry was converted to
     */
    public function convertedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'converted_to_order_id');
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
     * Get the discipline
     */
    public function discipline(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'discipline_id');
    }

    /**
     * Get the language
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    /**
     * Check if inquiry is a draft
     */
    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Check if inquiry has been converted to order
     */
    public function isConverted(): bool
    {
        return $this->status === self::STATUS_CONVERTED;
    }

    /**
     * Mark inquiry as submitted
     */
    public function markAsSubmitted(): void
    {
        $this->update([
            'status' => self::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Convert inquiry to order
     */
    public function convertToOrder(): Order
    {
        return DB::transaction(function () {
            // Create order from inquiry data
            $order = Order::create([
                'title' => $this->title,
                'description' => $this->description,
                'academic_level_id' => $this->academic_level_id,
                'paper_type' => $this->paper_type,
                'discipline_id' => $this->discipline_id,
                'service_type_id' => $this->service_type_id,
                'deadline_hours' => $this->deadline_hours,
                'language_id' => $this->language_id,
                'deadline_date' => $this->deadline_date,
                'pages' => $this->pages,
                'words' => $this->words,
                'spacing' => $this->spacing,
                'paper_format' => $this->paper_format,
                'number_of_sources' => $this->number_of_sources,
                'price' => $this->estimated_price ?? 0,
                'additional_features' => $this->additional_features,
                'client_notes' => $this->client_notes,
                'client_id' => $this->client_id,
                'status' => \App\Enums\OrderStatus::WAITING_FOR_PAYMENT,
            ]);

            // Update inquiry status
            $this->update([
                'status' => self::STATUS_CONVERTED,
                'converted_at' => now(),
                'converted_to_order_id' => $order->id,
            ]);

            return $order;
        });
    }

    /**
     * Get available inquiry statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_SUBMITTED => 'Submitted',
            self::STATUS_CONVERTED => 'Converted to Order',
        ];
    }
}
