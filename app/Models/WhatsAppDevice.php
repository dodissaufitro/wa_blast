<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppDevice extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_devices';

    protected $fillable = [
        'user_id',
        'name',
        'session_id',
        'phone',
        'push_name',
        'status',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
