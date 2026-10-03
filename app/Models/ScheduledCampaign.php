<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'target_audience',
        'total_recipients',
        'sent_count',
        'failed_count',
        'message',
        'device',
        'scheduled_date',
        'scheduled_time',
        'scheduled_at',
        'status',
    ];

    protected $casts = [
        'scheduled_date' => 'date:Y-m-d',
        'scheduled_at' => 'datetime',
    ];

    /**
     * Relationship to owner user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
