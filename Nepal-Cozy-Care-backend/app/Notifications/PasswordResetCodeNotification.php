<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetCodeNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $code,
        public int $expiresInMinutes
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Nepal Cozy Care password reset code')
            ->greeting('Hi '.$notifiable->name.',')
            ->line('Use this code to reset your Nepal Cozy Care password:')
            ->line($this->code)
            ->line('This code expires in '.$this->expiresInMinutes.' minutes.')
            ->line('If you did not request a password reset, you can ignore this email.');
    }
}
