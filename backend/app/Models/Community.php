<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Community extends Model
{
    use HasApiTokens, Notifiable, HasApiTokens;
    protected $fillable = [
        "name",
        "image",
        "desc"
    ];

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function post()
    {
        return $this->hasMany(CommunityPost::class, 'community_id');
    }

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function user()
    {
        return $this->belongsToMany(User::class, 'community_members', 'community_id', 'user_id');
    }
}
