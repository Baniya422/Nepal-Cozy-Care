<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('garden_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('source_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('nickname')->nullable();
            $table->string('city')->nullable();
            $table->string('room')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamp('last_watered_at')->nullable();
            $table->timestamp('last_fertilized_at')->nullable();
            $table->unsignedInteger('watering_frequency_days')->default(7);
            $table->unsignedInteger('fertilizing_frequency_days')->default(30);
            $table->date('acquired_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('garden_entries');
    }
};
