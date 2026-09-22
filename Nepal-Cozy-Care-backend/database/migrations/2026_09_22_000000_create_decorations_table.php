<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('decorations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->default('decorations'); // plants, furniture, pots, decorations
            $table->text('description')->nullable();
            $table->json('suitable_room_types')->nullable(); // ['office', 'living-room', 'bedroom', 'balcony', 'kitchen', 'bathroom']
            $table->decimal('width', 8, 2)->default(1.00); // meters
            $table->decimal('depth', 8, 2)->default(1.00); // meters
            $table->decimal('height', 8, 2)->default(1.00); // meters
            $table->string('default_color', 20)->default('#276749');
            $table->string('thumbnail_url')->nullable();
            $table->string('model_url')->nullable(); // path to GLB file
            $table->decimal('model_scale', 5, 2)->default(1.00);
            $table->decimal('model_rotation_offset', 5, 2)->default(0.00);
            $table->string('floor_alignment', 20)->default('floor'); // floor, tabletop, wall
            $table->foreignId('plant_id')->nullable()->constrained('plants')->nullOnDelete();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('status', 20)->default('draft'); // draft, published, archived
            $table->string('source_type', 30)->default('manual_upload'); // manual_upload, image_to_3d, built_in
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decorations');
    }
};
