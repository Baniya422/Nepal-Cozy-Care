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
        $settings = $this->settings();

        return response()->json([
            'message' => 'Admin settings loaded successfully.',
            'data' => [
                'account' => $request->user()->only(['id', 'name', 'email']),
                'mail' => $this->mailPayload($settings, $mailSettings),
                'launch' => $this->launchPayload($settings),
            ],
        ]);
    }

    public function publicFeatures(): JsonResponse
    {
        $settings = AdminSetting::current();

        return response()->json([
            'message' => null,
            'data' => [
                'vendor_marketplace_enabled' => (bool) $settings->vendor_marketplace_enabled,
                'esewa_enabled' => (bool) $settings->esewa_enabled,
                'free_delivery_threshold' => (float) ($settings->free_delivery_threshold ?? 2000.0),
                'free_delivery_radius_km' => (float) ($settings->free_delivery_radius_km ?? 10.0),
                'standard_delivery_fee' => (float) ($settings->standard_delivery_fee ?? 100.0),
                'dispatch_configured' => $settings->dispatch_latitude !== null && $settings->dispatch_longitude !== null,
                'dispatch_address' => $settings->dispatch_address,
            ],
        ]);
    }

    public function updateLaunch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vendor_marketplace_enabled' => ['required', 'boolean'],
            'esewa_enabled' => ['required', 'boolean'],
            'dispatch_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'dispatch_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'dispatch_address' => ['nullable', 'string', 'max:255'],
            'free_delivery_threshold' => ['required', 'numeric', 'min:0'],
            'free_delivery_radius_km' => ['required', 'numeric', 'min:0.1'],
            'standard_delivery_fee' => ['required', 'numeric', 'min:0'],
            'max_delivery_distance_km' => ['required', 'numeric', 'min:1'],
            'pricing_method' => ['required', 'in:distance_bands,per_km_rate'],
            'distance_pricing_rules' => ['nullable', 'array'],
            'routing_service' => ['required', 'in:osrm,openrouteservice,mapbox'],
            'routing_api_url' => ['nullable', 'string', 'max:255'],
            'routing_api_key' => ['nullable', 'string', 'max:255'],
            'clear_routing_api_key' => ['sometimes', 'boolean'],
            'site_production_url' => ['nullable', 'string', 'max:255'],
        ]);

        $settings = $this->settings();

        if ($request->filled('routing_api_key')) {
            $settings->routing_api_key = $request->input('routing_api_key');
        } elseif ($request->boolean('clear_routing_api_key')) {
            $settings->routing_api_key = null;
        }
        unset($validated['routing_api_key'], $validated['clear_routing_api_key']);

        $settings->fill($validated)->save();

        return response()->json([
            'message' => 'Launch and delivery settings saved successfully.',
            'data' => [
                'launch' => $this->launchPayload($settings->fresh()),
            ],
        ]);
    }

    private function launchPayload(AdminSetting $settings): array
    {
        return [
            'vendor_marketplace_enabled' => (bool) $settings->vendor_marketplace_enabled,
            'esewa_enabled' => (bool) $settings->esewa_enabled,
            'dispatch_latitude' => $settings->dispatch_latitude,
            'dispatch_longitude' => $settings->dispatch_longitude,
            'dispatch_address' => $settings->dispatch_address,
            'free_delivery_threshold' => (float) ($settings->free_delivery_threshold ?? 2000.0),
            'free_delivery_radius_km' => (float) ($settings->free_delivery_radius_km ?? 10.0),
            'standard_delivery_fee' => (float) ($settings->standard_delivery_fee ?? 100.0),
            'max_delivery_distance_km' => (float) ($settings->max_delivery_distance_km ?? 25.0),
            'pricing_method' => $settings->pricing_method ?: 'distance_bands',
            'distance_pricing_rules' => $settings->distance_pricing_rules ?: [
                ['min_km' => 10, 'max_km' => 15, 'fee' => 150],
                ['min_km' => 15, 'max_km' => 20, 'fee' => 220],
                ['min_km' => 20, 'max_km' => 25, 'fee' => 300],
            ],
            'routing_service' => $settings->routing_service ?: 'osrm',
            'routing_api_url' => $settings->routing_api_url,
            'routing_api_key_configured' => filled($settings->routing_api_key),
            'site_production_url' => $settings->site_production_url,
        ];
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

        $candidate = $settings->replicate();
        $candidate->fill($validated);
        if ($password !== null && $password !== '') {
            $validated['mail_password'] = $password;
            $candidate->mail_password = $password;
        } elseif ($request->boolean('clear_mail_password')) {
            $validated['mail_password'] = null;
            $candidate->mail_password = null;
        }

        if ($candidate->mail_enabled && ($issues = $mailSettings->configurationIssues($candidate))) {
            throw ValidationException::withMessages([
                'mail' => $issues,
            ]);
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
                "Nepal Cozy Care SMTP test successful.\n\nContact requests and new-order notifications will be delivered using these settings.",
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
