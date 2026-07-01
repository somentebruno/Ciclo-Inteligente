<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The "Ciclo Inteligente" itself: a personalised, ordered rotation of study
 * blocks generated from a course for a given user.
 */
class StudyCycle extends Model
{
    /** @use HasFactory<\Database\Factories\StudyCycleFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'name',
        'weekly_hours',
        'status',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'weekly_hours' => 'integer',
            'generated_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, StudyCycle>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Course, StudyCycle>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Ordered blocks that make up the cycle rotation.
     *
     * @return HasMany<StudyCycleItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(StudyCycleItem::class)->orderBy('position');
    }

    /**
     * @return HasMany<StudySession>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }
}
