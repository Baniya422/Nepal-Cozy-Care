<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Shop model representing an independent seller's shop or platform store.
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $slug
 * @property string|null $logo
 * @property string|null $banner
 * @property string|null $short_description
 * @property string|null $description
 * @property int|null $establishment_year
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $city
 * @property string|null $website
 * @property array|null $social_links
 * @property string $status ('pending', 'approved', 'suspended', 'rejected')
 * @property bool $is_verified
 * @property \Carbon\Carbon|null $approved_at
 * @property int|null $approved_by
 * @property string|null $rejection_reason
 */
class Shop extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'logo',
        'banner',
        'short_description',
        'description',
        'establishment_year',
        'email',
        'phone',
        'address',
        'city',
        'website',
        'social_links',
        'status',
        'is_verified',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    protected $casts = [
        'social_links' => 'array',
        'is_verified' => 'boolean',
        'establishment_year' => 'integer',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function plants(): HasMany
    {
        return $this->hasMany(Plant::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', self::STATUS_SUSPENDED);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}
