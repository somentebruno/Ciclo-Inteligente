<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * A preparatory course (e.g. "Concurso TRT", "ENEM 2026").
 * It is the top-level container of the study content tree.
 */
class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory;

    protected $fillable = [
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
