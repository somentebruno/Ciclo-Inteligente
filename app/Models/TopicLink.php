<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A study-material link (title + URL) a student attaches to a topic from the
 * edital verticalizado checklist.
 */
class TopicLink extends Model
{
    /** @use HasFactory<\Database\Factories\TopicLinkFactory> */
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'title',
        'url',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Topic, TopicLink>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}
