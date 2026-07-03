<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A topic inside a subject (e.g. "Crase", "Controle de Constitucionalidade").
 * A topic with subtopics is a grouping header, not itself a studyable unit —
 * see scopeStudyable().
 */
class Topic extends Model
{
    /** @use HasFactory<\Database\Factories\TopicFactory> */
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'parent_id',
        'name',
        'order',
        'estimated_minutes',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'estimated_minutes' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Subject, Topic>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * @return BelongsTo<Topic, Topic>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'parent_id');
    }

    /**
     * @return HasMany<Topic>
     */
    public function subtopics(): HasMany
    {
        return $this->hasMany(Topic::class, 'parent_id');
    }

    /**
     * @return HasMany<StudySession>
     */
    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }

    /**
     * Studyable (leaf) topics: no subtopics of their own. Topics with
     * subtopics are grouping headers, excluded from the task queue, the
     * study-log picker and the onboarding checklist.
     */
    public function scopeStudyable(Builder $query): Builder
    {
        return $query->whereDoesntHave('subtopics');
    }
}
