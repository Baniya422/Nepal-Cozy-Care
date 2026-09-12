<?php

use App\Support\PageContentDefaults;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            'contact_page' => ['Contact Page', PageContentDefaults::contact()],
            'shipping_page' => ['Shipping & Delivery Page', PageContentDefaults::shipping()],
        ] as $key => [$name, $payload]) {
            DB::table('content_templates')->updateOrInsert(
                ['key' => $key],
                [
                    'name' => $name,
                    'is_active' => true,
                    'payload' => json_encode($payload, JSON_UNESCAPED_SLASHES),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('content_templates')
            ->whereIn('key', ['contact_page', 'shipping_page'])
            ->delete();
    }
};
