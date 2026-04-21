<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {email : Recipient email address}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test email using the configured mailer';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $recipient = (string) $this->argument('email');

        if (! config('mail.from.address')) {
            $this->error('MAIL_FROM_ADDRESS is not configured.');

            return self::FAILURE;
        }

        try {
            Mail::raw(
                "Nepal Cozy Care SMTP test successful.\n\nIf you received this email, Gmail SMTP is working.",
                function ($message) use ($recipient): void {
                    $message
                        ->to($recipient)
                        ->subject('Nepal Cozy Care SMTP Test');
                }
            );
        } catch (\Throwable $exception) {
            $this->error('Test email failed to send.');
            $this->newLine();
            $this->line($exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Test email sent successfully to '.$recipient.'.');

        return self::SUCCESS;
    }
}
