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
            'mail.mailers.smtp.timeout' => config('mail.mailers.smtp.timeout', 10) ?: 10,
            'mail.from.address' => $settings->mail_from_address,
            'mail.from.name' => $settings->mail_from_name,
        ]);

        return true;
    }

    public function isConfigured(?AdminSetting $settings = null): bool
    {
        return $this->configurationIssues($settings) === [];
    }

    /**
     * Return human-readable reasons why notification email cannot be sent.
     *
     * @return array<int, string>
     */
    public function configurationIssues(?AdminSetting $settings = null): array
    {
        $settings ??= $this->current();
        if (! $settings) {
            return ['Email settings have not been saved.'];
        }

        $issues = [];
        if (! $settings->mail_enabled) {
            $issues[] = 'SMTP notifications are disabled.';
        }
        if (! filled($settings->mail_host)) {
            $issues[] = 'The SMTP host is missing.';
        }
        if (! $settings->mail_port) {
            $issues[] = 'The SMTP port is missing.';
        }
        if (! filled($settings->mail_from_address)) {
            $issues[] = 'The sender email address is missing.';
        }
        if (! filled($settings->mail_from_name)) {
            $issues[] = 'The sender name is missing.';
        }
        if (! filled($settings->contact_recipient)) {
            $issues[] = 'The notification recipient is missing.';
        }

        $hasUsername = filled($settings->mail_username);
        $hasPassword = filled($settings->mail_password);
        $host = strtolower(trim((string) $settings->mail_host));
        $isGmail = in_array($host, ['smtp.gmail.com', 'smtp.googlemail.com'], true);

        if ($isGmail && ! $hasUsername) {
            $issues[] = 'Gmail SMTP requires the full Gmail address as the username.';
        }
        if ($isGmail && ! $hasPassword) {
            $issues[] = 'Gmail SMTP requires a Google App Password.';
        }
        if (! $isGmail && $hasUsername !== $hasPassword) {
            $issues[] = 'The SMTP username and password must either both be provided or both be empty.';
        }

        return $issues;
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
