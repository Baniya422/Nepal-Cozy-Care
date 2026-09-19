<?php

namespace App\Mail;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerShopVerified extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Shop $shop) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🌿 Your Nursery "'.$this->shop->name.'" is Now Verified! - Nepal Cozy Care',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.seller-shop-verified',
        );
    }
}
