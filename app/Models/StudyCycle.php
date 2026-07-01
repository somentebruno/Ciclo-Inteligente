<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'daily_tasks',
        'weekly_tasks',
        'status',
        'generated_at',
        'onboarding_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'weekly_hours' => 'integer',
            'daily_tasks' => 'integer',
            'weekly_tasks' => 'integer',
            'generated_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
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

    /**
     * Subjects configured for this cycle, with per-cycle difficulty & format.
     *
     * @return BelongsToMany<Subject>
     */
    public function configuredSubjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'cycle_subject')
            ->withPivot(['difficulty', 'format'])
            ->withTimestamps();
    }

    /**
     * Topics the student marked as already studied (removed from the queue).
     *
     * @return BelongsToMany<Topic>
     */
    public function studiedTopics(): BelongsToMany
    {
        return $this->belongsToMany(Topic::class, 'cycle_topic')
            ->withPivot('already_studied')
            ->withTimestamps();
    }
}
