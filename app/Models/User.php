<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Study cycles that belong to this user.
     *
     * @return HasMany<StudyCycle>
     */
    public function studyCycles(): HasMany
    {
        return $this->hasMany(StudyCycle::class);
    }

    /**
     * The student's single study plan (cycle). The app enforces one plan per
     * user, so this is THE source of truth for "the current plan" everywhere
     * (home, tasks, reviews, weekly plan, plans page).
     */
    public function currentPlan(): ?StudyCycle
    {
        return $this->studyCycles()->latest('id')->first();
    }

    /**
     * Study sessions logged by this user.
     *
     * @return HasMany<StudySession>
     */
    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }
}
