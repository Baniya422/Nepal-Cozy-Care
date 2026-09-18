<?php

namespace App\Jobs;

use App\Mail\OrderPlacedAdmin;
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

    public function __construct(public int $orderId) {}

    public function handle(MailSettingsService $mailSettings): void
    {
        $order = Order::with(['items.plant', 'user'])->find($this->orderId);
        if (! $order) {
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
            Mail::to($mailSettings->notificationRecipient($settings))
                ->send(new OrderPlacedAdmin($order));

            $order->update([
                'notification_email_sent_at' => now(),
                'notification_email_error' => null,
            ]);
        } catch (\Throwable $exception) {
            $this->recordFailure($order, $exception->getMessage());
        }
    }

    private function recordFailure(Order $order, string $error, bool $configurationIssue = false): void
    {
        $error = Str::limit($error ?: 'Email delivery failed for an unknown reason.', 2000);
        $order->update([
            'notification_email_sent_at' => null,
            'notification_email_error' => $error,
        ]);

        Log::log($configurationIssue ? 'warning' : 'error', 'New order notification email failed.', [
            'order_id' => $order->id,
            'error' => $error,
        ]);
    }
}
