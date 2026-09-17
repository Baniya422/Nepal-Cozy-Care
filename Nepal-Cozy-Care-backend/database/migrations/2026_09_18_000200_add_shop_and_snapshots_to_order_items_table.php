<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('shop_id')->nullable()->after('plant_id')->constrained('shops')->nullOnDelete();
            $table->string('product_name')->nullable()->after('shop_id');
            $table->string('shop_name')->nullable()->after('product_name');

            $table->index('shop_id');
        });

        // Populate existing order items with product and shop name snapshots
        $defaultShop = DB::table('shops')->where('slug', 'nepal-cozy-care')->first();
        $defaultShopId = $defaultShop?->id;
        $defaultShopName = $defaultShop?->name ?? 'Nepal Cozy Care';

        $orderItems = DB::table('order_items')->get();
        foreach ($orderItems as $item) {
            $plant = DB::table('plants')->where('id', $item->plant_id)->first();
            $shopId = $plant?->shop_id ?? $defaultShopId;
            $shopName = $defaultShopName;
            if ($shopId) {
                $shop = DB::table('shops')->where('id', $shopId)->first();
                if ($shop) {
                    $shopName = $shop->name;
                }
            }

            DB::table('order_items')->where('id', $item->id)->update([
                'shop_id' => $shopId,
                'product_name' => $plant?->name ?? 'Plant Product',
                'shop_name' => $shopName,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn(['shop_id', 'product_name', 'shop_name']);
        });
    }
};
