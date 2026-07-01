<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A topic inside a subject (e.g. "Crase", "Controle de Constitucionalidade").
 * This is the finest-grained unit of study content.
 */
class Topic extends Model
{
    /** @use HasFactory<\Database\Factories\TopicFactory> */
    use HasFactory;

    protected $fillable = [
        'subject_id',
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
     * @return HasMany<StudySession>
     */
    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }
}
