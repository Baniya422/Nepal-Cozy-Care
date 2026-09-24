<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'author',
        'author_role',
        'author_bio',
        'author_image',
        'read_time',
        'tags',
        'tips',
        'takeaways',
        'category',
        'meta_title',
        'meta_description',
        'views',
        'is_published',
        'published_at',
        'is_top_trend',
        'is_top_story',
    ];

    protected $casts = [
        'tags' => 'array',
        'tips' => 'array',
        'takeaways' => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'is_top_trend' => 'boolean',
        'is_top_story' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
