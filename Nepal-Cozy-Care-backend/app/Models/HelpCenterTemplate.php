<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpCenterTemplate extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'categories',
        'faq_items',
        'topic_cards',
        'support_intro',
        'contact_phone',
        'contact_email',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'categories' => 'array',
        'faq_items' => 'array',
        'topic_cards' => 'array',
    ];
}
