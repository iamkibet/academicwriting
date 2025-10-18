<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'level',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function rates()
    {
        return $this->hasMany(AcademicRate::class);
    }

    public function activeRates()
    {
        return $this->hasMany(AcademicRate::class)->where('deleted', false);
    }
}