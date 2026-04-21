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
        $columns = array_values(array_filter([
            Schema::hasColumn('users', 'email_verified_at') ? 'email_verified_at' : null,
            Schema::hasColumn('users', 'email_verification_code') ? 'email_verification_code' : null,
            Schema::hasColumn('users', 'email_verification_code_expires_at')
                ? 'email_verification_code_expires_at'
                : null,
        ]));

        if ($columns === []) {
            return;
        }

        Schema::table('users', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable();
            }

            if (! Schema::hasColumn('users', 'email_verification_code')) {
                $table->string('email_verification_code')->nullable();
            }

            if (! Schema::hasColumn('users', 'email_verification_code_expires_at')) {
                $table->timestamp('email_verification_code_expires_at')->nullable();
            }
        });
    }
};
