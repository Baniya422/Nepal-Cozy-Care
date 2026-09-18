<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('notification_email_sent_at')->nullable()->after('location_confirmed_at');
            $table->text('notification_email_error')->nullable()->after('notification_email_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['notification_email_sent_at', 'notification_email_error']);
        });
    }
};
