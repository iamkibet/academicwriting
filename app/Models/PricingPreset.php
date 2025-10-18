<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingPreset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'academic_level',
        'service_type',
        'deadline_type',
        'base_price_per_page',
        'multiplier',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_price_per_page' => 'decimal:2',
            'multiplier' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Calculate price for given parameters
     */
    public static function calculatePrice(
        string $academicLevel,
        string $serviceType,
        string $deadlineType,
        int $pages
    ): float {
        $preset = self::where('academic_level', $academicLevel)
            ->where('service_type', $serviceType)
            ->where('deadline_type', $deadlineType)
            ->where('is_active', true)
            ->first();

        if (!$preset) {
            return 0.0;
        }

        return $preset->base_price_per_page * $preset->multiplier * $pages;
    }

    /**
     * Get all active presets
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get presets by academic level
     */
    public function scopeByAcademicLevel($query, string $level)
    {
        return $query->where('academic_level', $level);
    }

    /**
     * Get presets by service type
     */
    public function scopeByServiceType($query, string $type)
    {
        return $query->where('service_type', $type);
    }

    /**
     * Get presets by deadline type
     */
    public function scopeByDeadlineType($query, string $type)
    {
        return $query->where('deadline_type', $type);
    }

    /**
     * Get formatted price per page
     */
    public function getFormattedPricePerPageAttribute(): string
    {
        return '$' . number_format($this->base_price_per_page, 2);
    }

    /**
     * Get total price for given number of pages
     */
    public function getTotalPrice(int $pages): float
    {
        return $this->base_price_per_page * $this->multiplier * $pages;
    }

    /**
     * Get formatted total price for given number of pages
     */
    public function getFormattedTotalPrice(int $pages): string
    {
        return '$' . number_format($this->getTotalPrice($pages), 2);
    }
}
