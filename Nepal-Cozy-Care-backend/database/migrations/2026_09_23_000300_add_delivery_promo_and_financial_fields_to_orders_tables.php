<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->default('cod')->after('payment_status');
            $table->foreignId('promo_code_id')->nullable()->after('payment_method')->constrained('promo_codes')->nullOnDelete();
            $table->string('promo_code')->nullable()->after('promo_code_id');
            $table->decimal('discount_amount', 10, 2)->default(0.00)->after('promo_code');
            $table->decimal('delivery_latitude', 10, 7)->nullable()->after('shipping_address');
            $table->decimal('delivery_longitude', 10, 7)->nullable()->after('delivery_latitude');
            $table->decimal('delivery_road_distance_km', 8, 2)->nullable()->after('delivery_longitude');
            $table->json('delivery_quote_details')->nullable()->after('delivery_road_distance_km');
            $table->decimal('cod_collected_amount', 10, 2)->nullable()->after('total');
            $table->dateTime('cod_collected_at')->nullable()->after('cod_collected_amount');
            $table->foreignId('cod_collected_by')->nullable()->after('cod_collected_at')->constrained('users')->nullOnDelete();
            $table->boolean('earnings_incomplete')->default(false)->after('cod_collected_by');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('shop_name')->constrained('suppliers')->nullOnDelete();
            $table->string('supplier_name')->nullable()->after('supplier_id');
            $table->decimal('wholesale_unit_cost', 10, 2)->nullable()->after('supplier_name');
            $table->string('supplier_obligation_status')->default('payable')->after('wholesale_unit_cost'); // payable, waived, adjusted
            $table->string('supplier_payout_status')->default('unpaid')->after('supplier_obligation_status'); // unpaid, partially_paid, settled
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn([
                'supplier_id',
                'supplier_name',
                'wholesale_unit_cost',
                'supplier_obligation_status',
                'supplier_payout_status',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['promo_code_id']);
            $table->dropForeign(['cod_collected_by']);
            $table->dropColumn([
                'payment_method',
                'promo_code_id',
                'promo_code',
                'discount_amount',
                'delivery_latitude',
                'delivery_longitude',
                'delivery_road_distance_km',
                'delivery_quote_details',
                'cod_collected_amount',
                'cod_collected_at',
                'cod_collected_by',
                'earnings_incomplete',
            ]);
        });
    }
};
