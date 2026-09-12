<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User model representing a database user account.
 *
 * @property int $id Unique identifier for this user
 * @property string $name User's full name
 * @property string $email User's email address (unique)
 * @property string $password Hashed password
 * @property string $role Either 'customer' or 'admin'
 * @property \Carbon\Carbon $created_at When the account was created
 * @property \Carbon\Carbon $updated_at When the account was last modified
 * @property int $orders_count Cached count of user's orders (from withCount)
 * @property int $tokens_count Cached count of active API tokens (from withCount)
 * @property float $total_spent Cached sum of all order totals (from withSum)
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'password' => 'hashed',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function gardenEntries()
    {
        return $this->hasMany(GardenEntry::class);
    }
}
