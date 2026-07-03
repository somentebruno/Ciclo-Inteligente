<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A prep-course video lesson (aula do cursinho) for a subject — an attachable
 * study resource, distinct from a Topic (an edital item). Not linked to any
 * specific topic: the student picks freely from a subject's full lesson list
 * regardless of which edital topic they're logging a session against.
 */
class Aula extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'name',
        'order',
        'minutes',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'minutes' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Subject, Aula>
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
