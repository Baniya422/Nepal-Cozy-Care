<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->string('subject', 80)->default('general_inquiry')->after('city');
            $table->string('preferred_contact_method', 30)->default('phone')->after('subject');
            $table->string('order_reference', 60)->nullable()->after('preferred_contact_method');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn([
                'subject',
                'preferred_contact_method',
                'order_reference',
            ]);
        });
    }
};
