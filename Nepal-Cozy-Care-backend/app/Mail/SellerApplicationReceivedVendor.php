<?php

namespace App\Mail;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerApplicationReceivedVendor extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Shop $shop) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seller Application Received for "'.$this->shop->name.'" - Nepal Cozy Care',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.seller-application-received-vendor',
        );
    }
}
