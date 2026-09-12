<?php

use App\Support\HomepageDefaults;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('mail_enabled')->default(false);
            $table->string('mail_host')->nullable();
            $table->unsignedInteger('mail_port')->default(587);
            $table->string('mail_username')->nullable();
            $table->text('mail_password')->nullable();
            $table->string('mail_encryption', 10)->default('tls');
            $table->string('mail_from_address')->nullable();
            $table->string('mail_from_name')->default('Nepal Cozy Care');
            $table->string('contact_recipient')->nullable();
            $table->timestamps();
        });

        DB::table('admin_settings')->insert([
            'mail_enabled' => false,
            'mail_host' => 'smtp.gmail.com',
            'mail_port' => 587,
            'mail_encryption' => 'tls',
            'mail_from_name' => 'Nepal Cozy Care',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('content_templates')->updateOrInsert(
            ['key' => 'home_page'],
            [
                'name' => 'Home Page',
                'is_active' => true,
                'payload' => json_encode(HomepageDefaults::get(), JSON_UNESCAPED_SLASHES),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        Schema::table('contact_messages', function (Blueprint $table) {
            $table->timestamp('email_sent_at')->nullable()->after('resolved_at');
            $table->text('email_error')->nullable()->after('email_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn(['email_sent_at', 'email_error']);
        });
        DB::table('content_templates')->where('key', 'home_page')->delete();
        Schema::dropIfExists('admin_settings');
    }
};
