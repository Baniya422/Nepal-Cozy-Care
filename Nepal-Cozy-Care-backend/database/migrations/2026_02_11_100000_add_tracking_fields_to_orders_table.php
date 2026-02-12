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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('status');
            $table->string('courier_name')->nullable()->after('tracking_number');
            $table->string('courier_tracking_url')->nullable()->after('courier_name');
            $table->timestamp('packed_at')->nullable()->after('courier_tracking_url');
            $table->timestamp('shipped_at')->nullable()->after('packed_at');
            $table->timestamp('out_for_delivery_at')->nullable()->after('shipped_at');
            $table->timestamp('delivered_at')->nullable()->after('out_for_delivery_at');
            $table->timestamp('estimated_delivery_date')->nullable()->after('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'tracking_number',
                'courier_name',
                'courier_tracking_url',
                'packed_at',
                'shipped_at',
                'out_for_delivery_at',
                'delivered_at',
                'estimated_delivery_date',
            ]);
        });
    }
};
