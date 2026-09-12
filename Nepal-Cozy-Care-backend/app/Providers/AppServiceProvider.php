<?php

namespace App\Providers;

use App\Services\MailSettingsService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services before the app boots.
     */
    public function register(): void {}

    /**
     * Put startup-time app configuration here when the project needs it.
     */
    public function boot(MailSettingsService $mailSettings): void
    {
        try {
            $mailSettings->apply();
        } catch (\Throwable) {
            // Keep the application and migrations available if settings cannot be read yet.
        }
    }
}
