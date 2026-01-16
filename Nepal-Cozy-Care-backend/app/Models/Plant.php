<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'scientific_name',
        'category',
        'difficulty',
        'light',
        'water',
        'soil',
        'description',
        'price',
        'stock',
        'image',
        'is_active',
    ];
}
