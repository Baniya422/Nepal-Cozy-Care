<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_city')->nullable()->after('shipping_phone');
            $table->text('location_notes')->nullable()->after('shipping_address');
            $table->string('preferred_contact_method', 30)->default('phone')->after('location_notes');
            $table->string('confirmation_status', 30)->default('pending')->after('preferred_contact_method');
            $table->text('confirmation_notes')->nullable()->after('confirmation_status');
            $table->timestamp('contacted_at')->nullable()->after('confirmation_notes');
            $table->timestamp('location_confirmed_at')->nullable()->after('contacted_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_city',
                'location_notes',
                'preferred_contact_method',
                'confirmation_status',
                'confirmation_notes',
                'contacted_at',
                'location_confirmed_at',
            ]);
        });
    }
};
