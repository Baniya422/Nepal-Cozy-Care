<?php

namespace App\Mail;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerApplicationReceivedAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Shop $shop) {}

    public function envelope(): Envelope
    {
        $replyTo = $this->shop->email
            ? [new Address($this->shop->email, $this->shop->name)]
            : ($this->shop->user?->email ? [new Address($this->shop->user->email, $this->shop->user->name)] : []);

        return new Envelope(
            replyTo: $replyTo,
            subject: 'New Seller Application: "'.$this->shop->name.'" - Nepal Cozy Care',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.seller-application-received-admin',
        );
    }
}
