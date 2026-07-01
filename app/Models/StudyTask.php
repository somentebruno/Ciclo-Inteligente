<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A scheduled task in the student's queue: study (theory) or review one lesson.
 */
class StudyTask extends Model
{
    /** @use HasFactory<\Database\Factories\StudyTaskFactory> */
    use HasFactory;

    public const TYPE_THEORY = 'theory';
    public const TYPE_REVIEW = 'review';

    protected $fillable = [
        'user_id',
        'study_cycle_id',
        'subject_id',
        'topic_id',
        'title',
        'type',
        'format',
        'planned_minutes',
        'scheduled_for',
        'position',
        'status',
        'duration_seconds',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'planned_minutes' => 'integer',
            'position' => 'integer',
            'duration_seconds' => 'integer',
            'scheduled_for' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function isDone(): bool
    {
        return $this->status === 'done';
    }

    /**
     * @return BelongsTo<User, StudyTask>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<StudyCycle, StudyTask>
     */
    public function cycle(): BelongsTo
    {
        return $this->belongsTo(StudyCycle::class, 'study_cycle_id');
    }

    /**
     * @return BelongsTo<Subject, StudyTask>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * @return BelongsTo<Topic, StudyTask>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}
