<?php

namespace App\Enums;

enum OrderStatus: string
{
    case WAITING_FOR_PAYMENT = 'waiting_for_payment';
    case WRITER_PENDING = 'writer_pending';
    case IN_PROGRESS = 'in_progress';
    case REVIEW = 'review';
    case APPROVAL = 'approval';
    case CANCELLED = 'cancelled';
    case IN_REVISION = 'in_revision';

    /**
     * Get the display label for the status
     */
    public function getLabel(): string
    {
        return match($this) {
            self::WAITING_FOR_PAYMENT => 'Waiting for Payment',
            self::WRITER_PENDING => 'Writer Pending',
            self::IN_PROGRESS => 'In Progress',
            self::REVIEW => 'Review',
            self::APPROVAL => 'Approval',
            self::CANCELLED => 'Cancelled',
            self::IN_REVISION => 'In Revision',
        };
    }

    /**
     * Get the short label for the status
     */
    public function getShortLabel(): string
    {
        return match($this) {
            self::WAITING_FOR_PAYMENT => 'Payment',
            self::WRITER_PENDING => 'Writer',
            self::IN_PROGRESS => 'Progress',
            self::REVIEW => 'Review',
            self::APPROVAL => 'Approval',
            self::CANCELLED => 'Cancelled',
            self::IN_REVISION => 'Revision',
        };
    }

    /**
     * Get the color class for the status
     */
    public function getColorClass(): string
    {
        return match($this) {
            self::WAITING_FOR_PAYMENT => 'bg-yellow-100 text-yellow-800',
            self::WRITER_PENDING => 'bg-blue-100 text-blue-800',
            self::IN_PROGRESS => 'bg-orange-100 text-orange-800',
            self::REVIEW => 'bg-purple-100 text-purple-800',
            self::APPROVAL => 'bg-green-100 text-green-800',
            self::CANCELLED => 'bg-red-100 text-red-800',
            self::IN_REVISION => 'bg-yellow-100 text-yellow-800',
        };
    }

    /**
     * Get the progress stage index (0-4)
     */
    public function getProgressStage(): int
    {
        return match($this) {
            self::WAITING_FOR_PAYMENT => 0,
            self::WRITER_PENDING => 1,
            self::IN_PROGRESS => 2,
            self::REVIEW => 3,
            self::APPROVAL => 4,
            self::CANCELLED => -1, // Not shown in progress bar
            self::IN_REVISION => -1, // Not shown in progress bar
        };
    }

    /**
     * Get all status values as array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all statuses with their labels
     */
    public static function options(): array
    {
        return array_map(fn($status) => [
            'value' => $status->value,
            'label' => $status->getLabel(),
            'short_label' => $status->getShortLabel(),
        ], self::cases());
    }

    /**
     * Check if status transition is valid
     */
    public function canTransitionTo(OrderStatus $newStatus): bool
    {
        $validTransitions = [
            self::WAITING_FOR_PAYMENT => [self::WRITER_PENDING, self::CANCELLED, self::WAITING_FOR_PAYMENT],
            self::WRITER_PENDING => [self::IN_PROGRESS, self::CANCELLED, self::WRITER_PENDING],
            self::IN_PROGRESS => [self::REVIEW, self::CANCELLED, self::IN_PROGRESS],
            self::REVIEW => [self::APPROVAL, self::IN_REVISION, self::CANCELLED, self::REVIEW],
            self::APPROVAL => [self::APPROVAL],
            self::CANCELLED => [self::CANCELLED], // Cannot transition from cancelled
            self::IN_REVISION => [self::REVIEW, self::CANCELLED, self::IN_REVISION],
        ];

        return in_array($newStatus, $validTransitions[$this] ?? []);
    }

    /**
     * Get valid next statuses
     */
    public function getValidNextStatuses(): array
    {
        return array_filter(
            self::cases(),
            fn($status) => $this->canTransitionTo($status) && $status !== $this
        );
    }

    /**
     * Check if order is in active state
     */
    public function isActive(): bool
    {
        return in_array($this, [
            self::WRITER_PENDING,
            self::IN_PROGRESS,
            self::REVIEW,
            self::APPROVAL,
            self::IN_REVISION,
        ]);
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this === self::APPROVAL;
    }

    /**
     * Check if order requires payment
     */
    public function requiresPayment(): bool
    {
        return $this === self::WAITING_FOR_PAYMENT;
    }
}
