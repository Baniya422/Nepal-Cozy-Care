<?php

namespace App\Listeners;

use App\Events\OrderCreated;

class IncrementPlantSales
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Add each sold quantity to the plant's lifetime sales total.
     */
    public function handle(OrderCreated $event): void
    {
        foreach ($event->order->items as $item) {
            if ($item->plant) {
                $item->plant->increment('total_sold', $item->quantity);
            }
        }
    }
}
