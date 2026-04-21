# Nepal Cozy Care Backend

## Gmail SMTP Setup

The backend is now configured for Gmail SMTP. Laravel already includes SMTP mail support, so no extra package installation is required for this setup.

Update these values in `.env`:

```env
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=yourgmail@gmail.com
MAIL_PASSWORD=your-16-character-gmail-app-password
MAIL_FROM_ADDRESS="${MAIL_USERNAME}"
MAIL_FROM_NAME="${APP_NAME}"
```

## Gmail Account Requirements

1. Turn on Google 2-Step Verification for the Gmail account.
2. Generate a Google App Password.
3. Put that 16-character app password into `MAIL_PASSWORD`.

## Apply Config Changes

```bash
php artisan optimize:clear
```

## Send A Test Email

Use the built-in test command:

```bash
php artisan mail:test your-email@example.com
```

If that succeeds, forgot-password emails and other app mail will use Gmail SMTP too.
