<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPlacedAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        $replyTo = $this->order->user?->email
            ? [new Address($this->order->user->email, $this->order->shipping_name)]
            : [];

        return new Envelope(
            replyTo: $replyTo,
            subject: 'New order #'.$this->order->id.' - Nepal Cozy Care',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.order-placed-admin');
    }
}
