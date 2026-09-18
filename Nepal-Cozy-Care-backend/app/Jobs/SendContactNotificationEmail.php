<?php

namespace App\Jobs;

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Services\MailSettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendContactNotificationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $contactMessageId) {}

    public function handle(MailSettingsService $mailSettings): void
    {
        $contactMessage = ContactMessage::find($this->contactMessageId);
        if (! $contactMessage) {
            return;
        }

        try {
            $settings = $mailSettings->current();
            if (! $mailSettings->apply($settings)) {
                $this->recordFailure(
                    $contactMessage,
                    implode(' ', $mailSettings->configurationIssues($settings)),
                    true
                );

                return;
            }

            Mail::purge('smtp');
            Mail::to($mailSettings->notificationRecipient($settings))
                ->send(new ContactMessageReceived($contactMessage));

            $contactMessage->update([
                'email_sent_at' => now(),
                'email_error' => null,
            ]);
        } catch (\Throwable $exception) {
            $this->recordFailure($contactMessage, $exception->getMessage());
        }
    }

    private function recordFailure(
        ContactMessage $contactMessage,
        string $error,
        bool $configurationIssue = false
    ): void {
        $error = Str::limit($error ?: 'Email delivery failed for an unknown reason.', 2000);
        $contactMessage->update([
            'email_sent_at' => null,
            'email_error' => $error,
        ]);

        Log::log($configurationIssue ? 'warning' : 'error', 'Contact notification email failed.', [
            'contact_message_id' => $contactMessage->id,
            'error' => $error,
        ]);
    }
}
