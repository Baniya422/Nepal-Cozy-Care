<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->string('payment_method')->default('bank_transfer'); // bank_transfer, cash, cheque, other
            $table->string('reference')->nullable(); // voucher, transaction id, cheque no.
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('supplier_payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_payment_id')->constrained('supplier_payments')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedBigInteger('order_item_id')->nullable();
            $table->decimal('amount', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->cascadeOnDelete();
            $table->string('category')->default('delivery'); // delivery, packaging, transport, handling, other
            $table->decimal('amount', 10, 2);
            $table->string('description')->nullable();
            $table->dateTime('recorded_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('financial_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // supplier_payment_created, payment_status_updated, cod_collected, obligation_adjusted, expense_added, etc.
            $table->string('entity_type'); // supplier, order, order_item, supplier_payment, order_expense
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_audit_logs');
        Schema::dropIfExists('order_expenses');
        Schema::dropIfExists('supplier_payment_allocations');
        Schema::dropIfExists('supplier_payments');
        Schema::dropIfExists('suppliers');
    }
};
