<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plant_id')->constrained()->cascadeOnDelete();

            $table->integer('quantity')->default(1);

            $table->timestamps();

            // prevents duplicate same plant in same user cart
            $table->unique(['user_id', 'plant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
