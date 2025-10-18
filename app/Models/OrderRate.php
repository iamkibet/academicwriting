<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'hours',
        'label',
        'high_school',
        'under_graduate',
        'masters',
        'phd',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'high_school' => 'decimal:2',
            'under_graduate' => 'decimal:2',
            'masters' => 'decimal:2',
            'phd' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}