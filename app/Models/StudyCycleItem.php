<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A single block in a study cycle: "study Subject X for N minutes".
 * `position` defines the rotation order; `completed_minutes` tracks progress
 * so the cycle can advance to the next block automatically.
 */
class StudyCycleItem extends Model
{
    /** @use HasFactory<\Database\Factories\StudyCycleItemFactory> */
    use HasFactory;

    protected $fillable = [
        'study_cycle_id',
        'subject_id',
        'position',
        'planned_minutes',
        'completed_minutes',
        'is_done',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'planned_minutes' => 'integer',
            'completed_minutes' => 'integer',
            'is_done' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<StudyCycle, StudyCycleItem>
     */
    public function cycle(): BelongsTo
    {
        return $this->belongsTo(StudyCycle::class, 'study_cycle_id');
    }

    /**
     * @return BelongsTo<Subject, StudyCycleItem>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * @return HasMany<StudySession>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }
}
