<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class SeasonalReminder extends Model
{
    protected $fillable = [
        'user_id',
        'care_tip_id',
        'title',
        'excerpt',
        'content',
        'image',
        'season_key',
        'city',
        'priority',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function careTip()
    {
        return $this->belongsTo(CareTip::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeForSeason($query, string $seasonKey)
    {
        return $query->whereIn('season_key', [$seasonKey, 'all']);
    }

    public function scopeForCity($query, ?string $city)
    {
        $normalized = strtolower(trim((string) $city));

        if ($normalized === '') {
            return $query->whereNull('city');
        }

        return $query->where(function ($q) use ($normalized) {
            $q->whereNull('city')
                ->orWhereRaw('LOWER(city) = ?', [$normalized]);
        });
    }

    public static function currentSeasonKey(): string
    {
        $month = Carbon::now('Asia/Kathmandu')->month;

        return match (true) {
            $month >= 3 && $month <= 4 => 'spring',
            $month >= 5 && $month <= 6 => 'summer',
            $month >= 7 && $month <= 9 => 'monsoon',
            $month >= 10 && $month <= 11 => 'autumn',
            default => 'winter',
        };
    }

    public static function seasonLabels(): array
    {
        return [
            'all' => 'All Year',
            'spring' => 'Spring',
            'summer' => 'Summer',
            'monsoon' => 'Monsoon',
            'autumn' => 'Autumn',
            'winter' => 'Winter',
        ];
    }
}
