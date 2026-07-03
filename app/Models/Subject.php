<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A subject / discipline inside a course (e.g. "Português", "Direito Constitucional").
 * The `weight` drives how much time the intelligent cycle allocates to it.
 */
class Subject extends Model
{
    /** @use HasFactory<\Database\Factories\SubjectFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'slug',
        'weight',
        'difficulty',
        'color',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'integer',
            'difficulty' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Course, Subject>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return HasMany<Topic>
     */
    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class);
    }

    /**
     * @return HasMany<Aula>
     */
    public function aulas(): HasMany
    {
        return $this->hasMany(Aula::class);
    }

    /**
     * @return HasMany<StudyCycleItem>
     */
    public function cycleItems(): HasMany
    {
        return $this->hasMany(StudyCycleItem::class);
    }
}
