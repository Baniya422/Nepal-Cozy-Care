<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->text('survival_guide')->nullable()->after('description');
            $table->text('care_instructions')->nullable()->after('survival_guide');
            $table->string('temperature')->nullable()->after('water');
            $table->string('humidity')->nullable()->after('temperature');
            $table->string('fertilizer')->nullable()->after('humidity');
        });
    }

    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropColumn(['survival_guide', 'care_instructions', 'temperature', 'humidity', 'fertilizer']);
        });
    }
};
