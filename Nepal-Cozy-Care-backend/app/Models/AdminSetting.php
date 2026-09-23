<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminSetting extends Model
{
    protected $fillable = [
        'mail_enabled',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',
        'contact_recipient',
        'vendor_marketplace_enabled',
        'esewa_enabled',
        'dispatch_latitude',
        'dispatch_longitude',
        'dispatch_address',
        'free_delivery_threshold',
        'free_delivery_radius_km',
        'standard_delivery_fee',
        'max_delivery_distance_km',
        'pricing_method',
        'distance_pricing_rules',
        'routing_service',
        'routing_api_url',
        'routing_api_key',
        'site_production_url',
    ];

    protected $hidden = [
        'mail_password',
        'routing_api_key',
    ];

    protected $casts = [
        'mail_enabled' => 'boolean',
        'mail_port' => 'integer',
        'mail_password' => 'encrypted',
        'vendor_marketplace_enabled' => 'boolean',
        'esewa_enabled' => 'boolean',
        'dispatch_latitude' => 'float',
        'dispatch_longitude' => 'float',
        'free_delivery_threshold' => 'float',
        'free_delivery_radius_km' => 'float',
        'standard_delivery_fee' => 'float',
        'max_delivery_distance_km' => 'float',
        'distance_pricing_rules' => 'array',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'vendor_marketplace_enabled' => false,
            'esewa_enabled' => false,
            'free_delivery_threshold' => 2000.00,
            'free_delivery_radius_km' => 10.00,
            'standard_delivery_fee' => 100.00,
            'max_delivery_distance_km' => 25.00,
            'pricing_method' => 'distance_bands',
            'distance_pricing_rules' => [
                ['min_km' => 10, 'max_km' => 15, 'fee' => 150],
                ['min_km' => 15, 'max_km' => 20, 'fee' => 220],
                ['min_km' => 20, 'max_km' => 25, 'fee' => 300],
            ],
            'routing_service' => 'osrm',
        ]);
    }
}

