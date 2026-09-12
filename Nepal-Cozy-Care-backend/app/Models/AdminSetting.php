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
    ];

    protected $hidden = [
        'mail_password',
    ];

    protected $casts = [
        'mail_enabled' => 'boolean',
        'mail_port' => 'integer',
        'mail_password' => 'encrypted',
    ];
}
