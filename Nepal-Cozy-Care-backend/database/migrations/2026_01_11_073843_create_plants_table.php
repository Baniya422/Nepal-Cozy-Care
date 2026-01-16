<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plants', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('scientific_name')->nullable();
            $table->string('category')->nullable(); // for the categories exaple  Indoor, Outdoor, Succulent
            $table->string('difficulty')->default('Easy'); //  for the defaulties Easy/Medium/Hard

            $table->string('light')->nullable();      // for the filter Low/Indirect/Bright
            $table->string('water')->nullable();      //for data Weekly/2x week etc
            $table->string('soil')->nullable();

            $table->text('description')->nullable();

            $table->decimal('price', 10, 2)->default(0);
            $table->integer('stock')->default(0);

            $table->string('image')->nullable(); // for store image filename or URL

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plants');
    }
};
