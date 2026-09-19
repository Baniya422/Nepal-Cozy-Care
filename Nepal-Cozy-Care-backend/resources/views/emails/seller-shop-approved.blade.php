<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Seller Application Approved</title>
</head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;background:#f8fafc;padding:24px">
    <div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:20px">🎉</span>
            <span style="font-size:16px;font-weight:700;color:#059669;letter-spacing:0.5px">Nepal Cozy Care Marketplace</span>
        </div>
        <h1 style="font-size:24px;color:#0f172a;margin:0 0 16px">Congratulations! Your Nursery is Approved</h1>
        <p style="font-size:15px;color:#334155;margin:0 0 16px">
            Hello <strong>{{ $shop->user?->name ?? 'Partner' }}</strong>,
        </p>
        <p style="font-size:14px;color:#475569;margin:0 0 20px">
            Great news! Your application to become a registered vendor on <strong>Nepal Cozy Care</strong> for <strong>{{ $shop->name }}</strong> has been <strong>approved</strong> by the admin team!
        </p>

        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:20px;margin-bottom:24px">
            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#065f46;margin:0 0 12px">What this means for you:</h3>
            <ul style="margin:0;padding-left:20px;font-size:14px;color:#166534;line-height:1.8">
                <li>Your account now has full <strong>Seller Privileges</strong>.</li>
                <li>Your storefront profile is active at <strong>/shops/{{ $shop->slug }}</strong>.</li>
                <li>You can add, edit, and publish plants and garden accessories.</li>
                <li>You can publish specialized nursery plant care tips and stories.</li>
                <li>You can receive and fulfill customer plant orders directly.</li>
            </ul>
        </div>

        <div style="text-align:center;margin:28px 0">
            <a href="{{ config('app.url') }}/seller/dashboard" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;box-shadow:0 2px 6px rgba(5,150,105,0.3)">
                Go to Seller Dashboard &rarr;
            </a>
        </div>

        <p style="font-size:13px;color:#64748b;margin:0 0 16px">
            If you need any assistance getting started or setting up your storefront banner, feel free to reach out to our team at any time.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="font-size:12px;color:#94a3b8;margin:0">
            Nepal Cozy Care Plant Studio & Marketplace • Connecting plant lovers with trusted independent growers across Nepal.
        </p>
    </div>
</body>
</html>
