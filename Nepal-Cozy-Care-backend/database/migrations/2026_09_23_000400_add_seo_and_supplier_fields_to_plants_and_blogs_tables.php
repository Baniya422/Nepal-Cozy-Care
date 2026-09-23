<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('shop_id')->constrained('suppliers')->nullOnDelete();
            $table->decimal('wholesale_price', 10, 2)->nullable()->after('price');
            $table->string('meta_title')->nullable()->after('is_best_seller');
            $table->text('meta_description')->nullable()->after('meta_title');
        });

        Schema::table('blogs', function (Blueprint $table) {
            $table->string('meta_title')->nullable()->after('category');
            $table->text('meta_description')->nullable()->after('meta_title');
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn(['meta_title', 'meta_description']);
        });

        Schema::table('plants', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn([
                'supplier_id',
                'wholesale_price',
                'meta_title',
                'meta_description',
            ]);
        });
    }
};
