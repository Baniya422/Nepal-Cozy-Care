# Email delivery and admin performance

Deploy both the backend and frontend changes together. Run `php artisan migrate --force` before serving traffic, then rebuild the Laravel config cache. The Docker entrypoint runs migrations and starts Apache and a supervised database queue worker. Set `QUEUE_CONNECTION=database`; outside Docker, run `php artisan queue:work database --sleep=1 --tries=3 --timeout=45` under a process manager. Local `composer dev` also starts a worker. Restart workers after each deployment.

In Admin > Settings > SMTP Email Settings:

1. Enable SMTP. For Gmail, use `smtp.gmail.com`, port `587`, STARTTLS, your full Gmail address as username and sender, and a Google App Password (requires Google 2-Step Verification).
2. Set the notification recipient to the admin inbox. Orders also send a separate confirmation to the customer's account email.
3. Save settings, then send a test email. Blank password fields preserve the saved password; entering a replacement updates the encrypted secret. Admin login credentials and SMTP credentials are separate.
4. After a successful test, use **Retry failed notifications** to retry failed contact/admin/customer emails (up to 100 of each per click). Completed deliveries are skipped. Delivery is at least once: a process crash between SMTP acceptance and saving status can still duplicate an email.

Contact messages remain in Contact Inbox and orders remain in Orders if email fails. Order details show separate admin/customer delivery status. SMTP acceptance does not guarantee inbox placement: check spam and the sending provider's delivery logs.

## Hosting requirement

The repository's Render blueprint currently selects a free backend. Render Free blocks outbound SMTP on ports 25, 465 and 587 and sleeps after inactivity. Gmail SMTP will not work there, and the first API request after sleep can be slow. Use an SMTP-capable hosting plan for Gmail, or configure an email provider's supported alternative SMTP port. No hosting plan has been changed by this code update.

Official limits: https://render.com/docs/free

## Verification

Run `php artisan test --filter=AdminSettingsAndContactEmailTest` and `npm run build` in their respective backend/frontend directories. A real mailbox delivery check requires deployed credentials and SMTP network access. Do not put passwords in source control.
