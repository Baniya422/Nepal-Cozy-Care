<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('help_center_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Help Center Template');
            $table->boolean('is_active')->default(true);
            $table->json('categories');
            $table->json('faq_items');
            $table->json('topic_cards');
            $table->text('support_intro')->nullable();
            $table->string('contact_phone', 40)->nullable();
            $table->string('contact_email')->nullable();
            $table->timestamps();
        });

        DB::table('help_center_templates')->insert([
            'name' => 'Starter Help Center Template',
            'is_active' => true,
            'categories' => json_encode([
                ['key' => 'all', 'label' => 'All'],
                ['key' => 'orders', 'label' => 'Orders & Shipping'],
                ['key' => 'returns', 'label' => 'Returns & Refunds'],
                ['key' => 'payments', 'label' => 'Payments'],
                ['key' => 'account', 'label' => 'Account'],
            ]),
            'faq_items' => json_encode([
                [
                    'id' => 1,
                    'category' => 'orders',
                    'question' => 'How can I track my order?',
                    'answer' => 'Go to Track Order page, enter your order ID and email, and you will see live status updates including packed, shipped, and delivered states.',
                ],
                [
                    'id' => 2,
                    'category' => 'orders',
                    'question' => 'How long does delivery usually take?',
                    'answer' => 'Inside Kathmandu Valley, delivery usually takes 1-3 business days. Outside valley may take 3-6 business days based on courier coverage.',
                ],
                [
                    'id' => 3,
                    'category' => 'returns',
                    'question' => 'What if my plant arrives damaged?',
                    'answer' => 'Please contact support within 24 hours with order ID and clear photos. Our team will verify and arrange replacement or refund based on policy.',
                ],
                [
                    'id' => 4,
                    'category' => 'returns',
                    'question' => 'When will I receive my refund?',
                    'answer' => 'Approved refunds are processed within 3-7 business days. Actual credit timing may depend on your payment provider.',
                ],
                [
                    'id' => 5,
                    'category' => 'payments',
                    'question' => 'Which payment methods are accepted?',
                    'answer' => 'We currently support Cash on Delivery and online payments configured on your checkout flow. New payment gateways can be added progressively.',
                ],
                [
                    'id' => 6,
                    'category' => 'payments',
                    'question' => 'Why did my payment fail?',
                    'answer' => 'Payment can fail due to bank decline, network timeout, or insufficient funds. Retry once and contact support if the issue repeats.',
                ],
                [
                    'id' => 7,
                    'category' => 'account',
                    'question' => 'Do I need an account to place an order?',
                    'answer' => 'Yes, login is required for cart, checkout, and order history. This helps us secure your data and keep order tracking accurate.',
                ],
                [
                    'id' => 8,
                    'category' => 'account',
                    'question' => 'How can I update my phone number or address?',
                    'answer' => 'You can update shipping details during checkout. For account-level profile updates, contact support and we will assist immediately.',
                ],
            ]),
            'topic_cards' => json_encode([
                [
                    'id' => 'orders',
                    'icon' => 'Package',
                    'title' => 'Order & Shipping Help',
                    'points' => [
                        'Track orders in real-time from the Track Order page.',
                        'Delivery estimate depends on location and stock readiness.',
                        'Courier and tracking details are shown once shipped.',
                    ],
                ],
                [
                    'id' => 'returns',
                    'icon' => 'RotateCcw',
                    'title' => 'Returns & Refunds',
                    'points' => [
                        'Report damaged items within 24 hours of delivery.',
                        'Share clear photos and order ID for faster resolution.',
                        'Refund/replacement follows your return policy rules.',
                    ],
                ],
                [
                    'id' => 'payments',
                    'icon' => 'CreditCard',
                    'title' => 'Payment Help',
                    'points' => [
                        'Use available payment options shown at checkout.',
                        'Retry failed payments after checking balance/network.',
                        'Do not retry repeatedly if money is already deducted.',
                    ],
                ],
                [
                    'id' => 'delivery',
                    'icon' => 'Truck',
                    'title' => 'Delivery Support',
                    'points' => [
                        'Keep your shipping phone active during delivery window.',
                        'Update address instructions before dispatch if needed.',
                        'Contact support for delayed or missed deliveries.',
                    ],
                ],
            ]),
            'support_intro' => 'Still need help? Reach out to our support team and we will assist you quickly.',
            'contact_phone' => '+977-9800000000',
            'contact_email' => 'support@nepalcozycare.com',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('help_center_templates');
    }
};
