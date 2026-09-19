<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Nursery Verified Partner Badge</title>
</head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;background:#f8fafc;padding:24px">
    <div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:20px">🛡️</span>
            <span style="font-size:16px;font-weight:700;color:#059669;letter-spacing:0.5px">Nepal Cozy Care Marketplace</span>
        </div>
        <h1 style="font-size:24px;color:#0f172a;margin:0 0 16px">Your Nursery is Now a Verified Partner!</h1>
        <p style="font-size:15px;color:#334155;margin:0 0 16px">
            Hello <strong>{{ $shop->user?->name ?? 'Partner' }}</strong>,
        </p>
        <p style="font-size:14px;color:#475569;margin:0 0 20px">
            We are pleased to inform you that <strong>{{ $shop->name }}</strong> has been officially awarded the <strong>Verified Partner Nursery Badge</strong> by the Nepal Cozy Care administration!
        </p>

        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:20px;margin-bottom:24px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <span style="font-size:16px">✅</span>
                <strong style="font-size:15px;color:#166534">Verified Partner Nursery Status</strong>
            </div>
            <p style="font-size:14px;color:#15803d;margin:0;line-height:1.7">
                The Verified badge is now prominently displayed on your store profile and next to your catalog listings across the marketplace. This status signals quality, authentic botanical sourcing, and trust to plant enthusiasts across Nepal.
            </p>
        </div>

        <div style="text-align:center;margin:28px 0">
            <a href="{{ config('app.url') }}/shops/{{ $shop->slug }}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;box-shadow:0 2px 6px rgba(5,150,105,0.3)">
                View Your Verified Storefront &rarr;
            </a>
        </div>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="font-size:12px;color:#94a3b8;margin:0">
            Nepal Cozy Care Plant Studio & Marketplace • Connecting plant lovers with trusted independent growers across Nepal.
        </p>
    </div>
</body>
</html>
