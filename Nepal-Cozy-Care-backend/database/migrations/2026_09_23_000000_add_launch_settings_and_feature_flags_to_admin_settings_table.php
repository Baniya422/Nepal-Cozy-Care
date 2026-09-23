<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_settings', function (Blueprint $table) {
            // Feature flags
            $table->boolean('vendor_marketplace_enabled')->default(false)->after('contact_recipient');
            $table->boolean('esewa_enabled')->default(false)->after('vendor_marketplace_enabled');

            // Dispatch and location-based delivery pricing settings
            $table->decimal('dispatch_latitude', 10, 7)->nullable()->after('esewa_enabled');
            $table->decimal('dispatch_longitude', 10, 7)->nullable()->after('dispatch_latitude');
            $table->string('dispatch_address')->nullable()->after('dispatch_longitude');
            $table->decimal('free_delivery_threshold', 10, 2)->default(2000.00)->after('dispatch_address');
            $table->decimal('free_delivery_radius_km', 8, 2)->default(10.00)->after('free_delivery_threshold');
            $table->decimal('standard_delivery_fee', 10, 2)->default(100.00)->after('free_delivery_radius_km');
            $table->decimal('max_delivery_distance_km', 8, 2)->default(25.00)->after('standard_delivery_fee');
            $table->string('pricing_method')->default('distance_bands')->after('max_delivery_distance_km'); // distance_bands or per_km_rate
            $table->json('distance_pricing_rules')->nullable()->after('pricing_method');
            $table->string('routing_service')->default('osrm')->after('distance_pricing_rules'); // osrm, openrouteservice, mapbox
            $table->string('routing_api_url')->nullable()->after('routing_service');
            $table->string('routing_api_key')->nullable()->after('routing_api_url');
            $table->string('site_production_url')->nullable()->after('routing_api_key');
        });
    }

    public function down(): void
    {
        Schema::table('admin_settings', function (Blueprint $table) {
            $table->dropColumn([
                'vendor_marketplace_enabled',
                'esewa_enabled',
                'dispatch_latitude',
                'dispatch_longitude',
                'dispatch_address',
                'free_delivery_threshold',
                'free_delivery_radius_km',
                'standard_delivery_fee',
                'max_delivery_distance_km',
                'pricing_method',
                'distance_pricing_rules',
                'routing_service',
                'routing_api_url',
                'routing_api_key',
                'site_production_url',
            ]);
        });
    }
};
