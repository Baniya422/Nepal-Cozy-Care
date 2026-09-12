<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->json('rooms')->nullable()->after('humidity');
            $table->json('quantity_categories')->nullable()->after('rooms');
        });
    }

    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropColumn(['rooms', 'quantity_categories']);
        });
    }
};
