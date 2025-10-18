<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by_user_id',
        'file_category',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    // File categories
    const CATEGORY_REQUIREMENTS = 'requirements';
    const CATEGORY_DRAFT = 'draft';
    const CATEGORY_SUBMISSION = 'submission';
    const CATEGORY_FINAL = 'final';
    const CATEGORY_REVISION = 'revision';

    /**
     * Get the order that owns this file
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who uploaded this file
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    /**
     * Get formatted file size
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get available file categories
     */
    public static function getFileCategories(): array
    {
        return [
            self::CATEGORY_REQUIREMENTS => 'Requirements',
            self::CATEGORY_DRAFT => 'Draft',
            self::CATEGORY_SUBMISSION => 'Submission',
            self::CATEGORY_FINAL => 'Final',
            self::CATEGORY_REVISION => 'Revision',
        ];
    }
}
