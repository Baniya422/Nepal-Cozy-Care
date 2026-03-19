<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seasonal_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('care_tip_id')->nullable()->constrained('care_tips')->nullOnDelete();
            $table->string('title');
            $table->string('excerpt', 500)->nullable();
            $table->text('content');
            $table->string('image')->nullable();
            $table->string('season_key', 20)->default('all');
            $table->string('city')->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seasonal_reminders');
    }
};
