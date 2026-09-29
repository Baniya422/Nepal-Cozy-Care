<?php

namespace App\Jobs;

use App\Mail\OrderPlacedAdmin;
use App\Mail\OrderPlacedCustomer;
use App\Models\Order;
use App\Services\MailSettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendOrderNotificationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 45;

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function __construct(public int $orderId, public bool $customer = false) {}

    private function statusPrefix(): string
    {
        return $this->customer ? 'customer_notification_email' : 'notification_email';
    }

    public function handle(MailSettingsService $mailSettings): void
    {
        $order = Order::with(['items.plant', 'user'])->find($this->orderId);
        if (! $order || $order->{$this->statusPrefix().'_sent_at'}) {
            return;
        }

        try {
            $settings = $mailSettings->current();
            if (! $mailSettings->apply($settings)) {
                $this->recordFailure(
                    $order,
                    implode(' ', $mailSettings->configurationIssues($settings)),
                    true
                );

                return;
            }

            Mail::purge('smtp');
            $recipient = $this->customer ? $order->user?->email : $mailSettings->notificationRecipient($settings);
            if (! filled($recipient)) {
                throw new \RuntimeException('The customer email address is missing.');
            }
            Mail::to($recipient)->send($this->customer
                ? new OrderPlacedCustomer($order)
                : new OrderPlacedAdmin($order));

            $order->update([
                $this->statusPrefix().'_sent_at' => now(),
                $this->statusPrefix().'_error' => null,
            ]);
        } catch (\Throwable $exception) {
            $this->recordFailure($order, $exception->getMessage());
            if ($this->job && $this->job->getConnectionName() !== 'sync') {
                throw $exception;
            }
        }
    }

    private function recordFailure(Order $order, string $error, bool $configurationIssue = false): void
    {
        $error = Str::limit($error ?: 'Email delivery failed for an unknown reason.', 2000);
        $order->update([
            $this->statusPrefix().'_sent_at' => null,
            $this->statusPrefix().'_error' => $error,
        ]);

        Log::log($configurationIssue ? 'warning' : 'error', 'New order notification email failed.', [
            'order_id' => $order->id,
            'error' => $error,
        ]);
    }
}
