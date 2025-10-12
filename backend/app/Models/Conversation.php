<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Conversation extends Model
{
    use HasApiTokens, Notifiable, HasFactory;
    protected $fillable = [
        "sender",
        "receiver"
    ];

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function senders()
    {
        return $this->belongsTo(User::class, 'sender');
    }

    public function receivers()
    {
        return $this->belongsTo(User::class, 'receiver');
    }

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function message()
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }
}
