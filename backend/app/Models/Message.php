<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Message extends Model
{
    use HasFactory, Notifiable, HasApiTokens;
    protected $fillable = [
        "conversation_id",
        "sender",
        "message",
        "image",
        "isread"
    ];

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }
}
