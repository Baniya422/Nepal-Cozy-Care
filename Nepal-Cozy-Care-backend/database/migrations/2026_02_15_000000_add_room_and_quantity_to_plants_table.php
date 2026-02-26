<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->json('rooms')->nullable()->after('humidity'); // JSON to store suitable rooms: Bedroom, Living Room, Kitchen, etc.
            $table->json('quantity_categories')->nullable()->after('rooms'); // JSON to store quantity options: One, 2-3, 4-5, More than 5
        });
    }

    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropColumn(['rooms', 'quantity_categories']);
        });
    }
};
