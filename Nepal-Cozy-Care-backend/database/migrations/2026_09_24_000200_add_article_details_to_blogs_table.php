<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->string('author_role', 150)->nullable();
            $table->text('author_bio')->nullable();
            $table->text('author_image')->nullable();
            $table->string('read_time', 50)->nullable();
            $table->json('tags')->nullable();
            $table->json('tips')->nullable();
            $table->json('takeaways')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn(['author_role', 'author_bio', 'author_image', 'read_time', 'tags', 'tips', 'takeaways']);
        });
    }
};
