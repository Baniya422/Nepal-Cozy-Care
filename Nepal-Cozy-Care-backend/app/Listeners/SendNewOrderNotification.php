<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Mail\OrderPlacedAdmin;
use App\Services\MailSettingsService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNewOrderNotification
{
    public function __construct(private MailSettingsService $mailSettings) {}

    public function handle(OrderCreated $event): void
    {
        $settings = $this->mailSettings->current();
        if (! $this->mailSettings->apply($settings)) {
            return;
        }

        try {
            Mail::purge('smtp');
            $order = $event->order->loadMissing(['items.plant', 'user']);

            Mail::to($this->mailSettings->notificationRecipient($settings))
                ->send(new OrderPlacedAdmin($order));
        } catch (\Throwable $exception) {
            Log::error('New order notification email failed.', [
                'order_id' => $event->order->id,
                'recipient' => $this->mailSettings->notificationRecipient($settings),
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
