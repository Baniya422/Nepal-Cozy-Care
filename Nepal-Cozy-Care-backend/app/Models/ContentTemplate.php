<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentTemplate extends Model
{
    protected $fillable = [
        'name',
        'key',
        'is_active',
        'payload',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'payload' => 'array',
    ];
}
