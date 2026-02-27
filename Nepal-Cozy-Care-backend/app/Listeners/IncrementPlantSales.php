<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class IncrementPlantSales
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(OrderCreated $event): void
    {
        // Loop through all order items and increment total_sold for each plant
        $event->order->items()->each(function ($item) {
            $item->plant()->increment('total_sold', $item->quantity);
        });
    }
}
