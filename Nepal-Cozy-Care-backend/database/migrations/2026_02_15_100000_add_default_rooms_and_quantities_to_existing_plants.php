<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('plants')->update([
            'rooms' => DB::raw("JSON_ARRAY('Living Room', 'Bedroom')"),
            'quantity_categories' => DB::raw("JSON_ARRAY('One', '2-3')"),
        ]);
    }

    public function down(): void
    {
        DB::table('plants')->update([
            'rooms' => null,
            'quantity_categories' => null,
        ]);
    }
};
