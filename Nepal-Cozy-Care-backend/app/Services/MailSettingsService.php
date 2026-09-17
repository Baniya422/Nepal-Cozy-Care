<?php

namespace App\Services;

use App\Models\AdminSetting;
use Illuminate\Support\Facades\Schema;

class MailSettingsService
{
    public function current(): ?AdminSetting
    {
        if (! Schema::hasTable('admin_settings')) {
            return null;
        }

        return AdminSetting::query()->first();
    }

    public function apply(?AdminSetting $settings = null): bool
    {
        $settings ??= $this->current();
        if (! $this->isConfigured($settings)) {
            return false;
        }

        $encryption = $settings->mail_encryption ?: 'tls';
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.transport' => 'smtp',
            'mail.mailers.smtp.scheme' => $encryption === 'ssl' ? 'smtps' : 'smtp',
            'mail.mailers.smtp.host' => $settings->mail_host,
            'mail.mailers.smtp.port' => $settings->mail_port,
            'mail.mailers.smtp.username' => $settings->mail_username,
            'mail.mailers.smtp.password' => $settings->mail_password,
            'mail.mailers.smtp.auto_tls' => $encryption !== 'none',
            'mail.mailers.smtp.require_tls' => $encryption === 'tls',
            'mail.from.address' => $settings->mail_from_address,
            'mail.from.name' => $settings->mail_from_name,
        ]);

        return true;
    }

    public function isConfigured(?AdminSetting $settings = null): bool
    {
        $settings ??= $this->current();

        return (bool) ($settings?->mail_enabled
            && $settings->mail_host
            && $settings->mail_port
            && $settings->mail_from_address
            && $settings->contact_recipient);
    }

    public function recipient(?AdminSetting $settings = null): ?string
    {
        return $this->notificationRecipient($settings);
    }

    public function notificationRecipient(?AdminSetting $settings = null): ?string
    {
        $settings ??= $this->current();

        return $settings?->contact_recipient;
    }
}
