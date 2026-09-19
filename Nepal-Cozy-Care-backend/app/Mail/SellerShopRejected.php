<?php

namespace App\Mail;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SellerShopRejected extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Shop $shop, public ?string $reason = null) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Update on Your Seller Application for "'.$this->shop->name.'" - Nepal Cozy Care',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.seller-shop-rejected',
        );
    }
}
