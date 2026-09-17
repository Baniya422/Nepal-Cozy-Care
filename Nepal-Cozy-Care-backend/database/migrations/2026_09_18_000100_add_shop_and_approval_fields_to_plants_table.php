<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->foreignId('shop_id')->nullable()->after('id')->constrained('shops')->nullOnDelete();
            $table->string('approval_status')->default('approved')->after('is_active'); // draft, pending, approved, rejected, archived
            $table->text('rejection_reason')->nullable()->after('approval_status');
            $table->timestamp('submitted_at')->nullable()->after('rejection_reason');

            $table->index('approval_status');
            $table->index('shop_id');
        });

        // Ensure default Nepal Cozy Care shop exists and associate all existing products
        $adminUser = DB::table('users')->whereIn('role', ['admin', 'super_admin'])->first();
        if (! $adminUser) {
            $adminUser = DB::table('users')->first();
        }

        if ($adminUser) {
            $now = now();
            $shopId = DB::table('shops')->where('slug', 'nepal-cozy-care')->value('id');

            if (! $shopId) {
                $shopId = DB::table('shops')->insertGetId([
                    'user_id' => $adminUser->id,
                    'name' => 'Nepal Cozy Care',
                    'slug' => 'nepal-cozy-care',
                    'short_description' => 'Official Nepal Cozy Care store offering nursery-nurtured plants and care accessories.',
                    'description' => 'Welcome to Nepal Cozy Care. We nurture healthy houseplants, hardy outdoor greens, and curated accessories designed for homes and gardens across Nepal.',
                    'city' => 'Kathmandu',
                    'address' => 'Kathmandu, Nepal',
                    'email' => $adminUser->email ?? 'info@nepalcozycare.com',
                    'phone' => '+977-1-4400000',
                    'status' => 'approved',
                    'is_verified' => true,
                    'approved_at' => $now,
                    'approved_by' => $adminUser->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // Assign all existing plants to the default shop
            DB::table('plants')->whereNull('shop_id')->update([
                'shop_id' => $shopId,
                'approval_status' => 'approved',
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropForeign(['shop_id']);
            $table->dropColumn(['shop_id', 'approval_status', 'rejection_reason', 'submitted_at']);
        });
    }
};
