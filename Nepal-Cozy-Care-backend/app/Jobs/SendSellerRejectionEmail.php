<?php

namespace App\Jobs;

use App\Mail\SellerShopRejected;
use App\Models\Shop;
use App\Services\MailSettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSellerRejectionEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $shopId, public ?string $reason = null) {}

    public function handle(MailSettingsService $mailSettings): void
    {
        $shop = Shop::with('user')->find($this->shopId);
        if (! $shop) {
            return;
        }

        try {
            $settings = $mailSettings->current();
            if (! $mailSettings->apply($settings)) {
                Log::warning('SMTP not configured for seller rejection notification email.', [
                    'shop_id' => $shop->id,
                    'issues' => $mailSettings->configurationIssues($settings),
                ]);

                return;
            }

            Mail::purge('smtp');

            $vendorEmail = $shop->email ?: $shop->user?->email;
            if ($vendorEmail) {
                Mail::to($vendorEmail)->send(new SellerShopRejected($shop, $this->reason));
            }
        } catch (\Throwable $exception) {
            Log::error('Failed to send seller rejection email.', [
                'shop_id' => $shop->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
