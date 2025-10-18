<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_level_id',
        'hours',
        'label',
        'cost',
        'deleted',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'deleted' => 'boolean',
        ];
    }

    public function academicLevel()
    {
        return $this->belongsTo(AcademicLevel::class);
    }
}