<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Services\MailSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AdminSettingsController extends Controller
{
    public function show(Request $request, MailSettingsService $mailSettings)
    {
        return response()->json([
            'message' => 'Admin settings loaded successfully.',
            'data' => [
                'account' => $request->user()->only(['id', 'name', 'email']),
                'mail' => $this->mailPayload($this->settings(), $mailSettings),
            ],
        ]);
    }

    public function updateMail(Request $request, MailSettingsService $mailSettings)
    {
        $validated = $request->validate([
            'mail_enabled' => ['required', 'boolean'],
            'mail_host' => ['nullable', 'required_if:mail_enabled,true', 'string', 'max:255'],
            'mail_port' => ['nullable', 'required_if:mail_enabled,true', 'integer', 'between:1,65535'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:500'],
            'clear_mail_password' => ['sometimes', 'boolean'],
            'mail_encryption' => ['required', 'in:tls,ssl,none'],
            'mail_from_address' => ['nullable', 'required_if:mail_enabled,true', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'required_if:mail_enabled,true', 'string', 'max:255'],
            'contact_recipient' => ['nullable', 'required_if:mail_enabled,true', 'email', 'max:255'],
        ]);
        $settings = $this->settings();
        $password = $validated['mail_password'] ?? null;
        unset($validated['mail_password'], $validated['clear_mail_password']);
        if ($password !== null && $password !== '') {
            $validated['mail_password'] = $password;
        } elseif ($request->boolean('clear_mail_password')) {
            $validated['mail_password'] = null;
        }
        $settings->fill($validated)->save();

        $mailSettings->apply($settings->fresh());
        Mail::purge('smtp');

        return response()->json([
            'message' => 'Email settings saved successfully.',
            'data' => [
                'mail' => $this->mailPayload($settings->fresh(), $mailSettings),
            ],
        ]);
    }

    public function testMail(Request $request, MailSettingsService $mailSettings)
    {
        $validated = $request->validate([
            'recipient' => ['nullable', 'email', 'max:255'],
        ]);
        $settings = $this->settings();
        if (! $mailSettings->apply($settings)) {
            throw ValidationException::withMessages([
                'mail' => ['Enable SMTP and complete the required email settings first.'],
            ]);
        }
        $recipient = $validated['recipient'] ?? $settings->contact_recipient;
        Mail::purge('smtp');

        try {
            Mail::raw(
                "Nepal Cozy Care SMTP test successful.\n\nContact-form notifications will be delivered using these settings.",
                fn ($message) => $message->to($recipient)->subject('Nepal Cozy Care SMTP Test')
            );
        } catch (\Throwable $exception) {
            throw ValidationException::withMessages([
                'mail' => ['SMTP test failed: '.$exception->getMessage()],
            ]);
        }

        return response()->json([
            'message' => 'Test email sent successfully to '.$recipient.'.',
        ]);
    }

    private function settings(): AdminSetting
    {
        return AdminSetting::query()->firstOrCreate([], [
            'mail_enabled' => false,
            'mail_host' => 'smtp.gmail.com',
            'mail_port' => 587,
            'mail_encryption' => 'tls',
            'mail_from_name' => 'Nepal Cozy Care',
        ]);
    }

    private function mailPayload(AdminSetting $settings, MailSettingsService $mailSettings): array
    {
        return [
            'mail_enabled' => $settings->mail_enabled,
            'mail_host' => $settings->mail_host,
            'mail_port' => $settings->mail_port,
            'mail_username' => $settings->mail_username,
            'mail_password_configured' => filled($settings->mail_password),
            'mail_encryption' => $settings->mail_encryption,
            'mail_from_address' => $settings->mail_from_address,
            'mail_from_name' => $settings->mail_from_name,
            'contact_recipient' => $settings->contact_recipient,
            'is_configured' => $mailSettings->isConfigured($settings),
        ];
    }
}
