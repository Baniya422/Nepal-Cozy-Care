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
        if (class_exists(\Illuminate\Foundation\Console\ServeCommand::class)) {
            \Illuminate\Foundation\Console\ServeCommand::$passthroughVariables = array_merge(
                \Illuminate\Foundation\Console\ServeCommand::$passthroughVariables,
                [
                    'SystemRoot',
                    'SystemDrive',
                    'windir',
                    'WINDIR',
                    'ComSpec',
                    'COMSPEC',
                    'TEMP',
                    'TMP',
                    'LOCALAPPDATA',
                    'APPDATA',
                    'USERPROFILE',
                ]
            );
        }

        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        try {
            $mailSettings->apply();
        } catch (\Throwable) {
            // Keep the application and migrations available if settings cannot be read yet.
        }
    }
}
