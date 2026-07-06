<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * A preparatory course (e.g. "Concurso TRT", "ENEM 2026").
 * It is the top-level container of the study content tree.
 *
 * A course with a null `user_id` is a shared catalog entry (a seeded edital);
 * one with a `user_id` is a private course a student built from scratch for a
 * "plano personalizado" — see scopeCatalog().
 */
class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'orgao',
        'slug',
        'description',
        'exam_board',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, Course>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Shared catalog courses only — excludes students' private/custom courses.
     */
    public function scopeCatalog(Builder $query): Builder
    {
        return $query->whereNull('user_id');
    }

    /**
     * @return HasMany<Subject>
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * @return HasMany<Cargo>
     */
    public function cargos(): HasMany
    {
        return $this->hasMany(Cargo::class);
    }

    /**
     * All topics of the course, through its subjects.
     *
     * @return HasManyThrough<Topic>
     */
    public function topics(): HasManyThrough
    {
        return $this->hasManyThrough(Topic::class, Subject::class);
    }

    /**
     * @return HasMany<StudyCycle>
     */
    public function studyCycles(): HasMany
    {
        return $this->hasMany(StudyCycle::class);
    }
}
