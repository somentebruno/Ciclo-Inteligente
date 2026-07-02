<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A logged study session: how long the user actually studied, and (optionally)
 * how many questions they answered. Feeds the analytics that make the cycle
 * "intelligent" (adjusting weights based on performance).
 */
class StudySession extends Model
{
    /** @use HasFactory<\Database\Factories\StudySessionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'study_cycle_id',
        'study_cycle_item_id',
        'topic_id',
        'category',
        'material',
        'pages_read',
        'counts_in_plan',
        'studied_at',
        'duration_minutes',
        'questions_total',
        'questions_correct',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'studied_at' => 'datetime',
            'duration_minutes' => 'integer',
            'questions_total' => 'integer',
            'questions_correct' => 'integer',
            'pages_read' => 'integer',
            'counts_in_plan' => 'boolean',
        ];
    }

    /**
     * Percentage of correct answers (0-100), or null when no questions logged.
     */
    public function accuracy(): ?float
    {
        if (! $this->questions_total) {
            return null;
        }

        return round(($this->questions_correct / $this->questions_total) * 100, 1);
    }

    /**
     * @return BelongsTo<User, StudySession>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<StudyCycle, StudySession>
     */
    public function cycle(): BelongsTo
    {
        return $this->belongsTo(StudyCycle::class, 'study_cycle_id');
    }

    /**
     * @return BelongsTo<StudyCycleItem, StudySession>
     */
    public function cycleItem(): BelongsTo
    {
        return $this->belongsTo(StudyCycleItem::class, 'study_cycle_item_id');
    }

    /**
     * @return BelongsTo<Topic, StudySession>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}
