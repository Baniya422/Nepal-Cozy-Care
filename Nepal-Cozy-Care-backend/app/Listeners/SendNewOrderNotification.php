<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Jobs\SendOrderNotificationEmail;

class SendNewOrderNotification
{
    public function handle(OrderCreated $event): void
    {
        // Checkout should not wait for the external SMTP server.
        SendOrderNotificationEmail::dispatch($event->order->id)->afterResponse();
    }
}
