<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A position (cargo) offered by a concurso/plan.
 */
class Cargo extends Model
{
    /** @use HasFactory<\Database\Factories\CargoFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'code',
    ];

    /**
     * @return BelongsTo<Course, Cargo>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
