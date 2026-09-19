<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Seller Application Received</title>
</head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;background:#f8fafc;padding:24px">
    <div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:20px">🌿</span>
            <span style="font-size:16px;font-weight:700;color:#059669;letter-spacing:0.5px">Nepal Cozy Care Marketplace</span>
        </div>
        <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px">Seller Application Received</h1>
        <p style="font-size:15px;color:#334155;margin:0 0 16px">
            Hello <strong>{{ $shop->user?->name ?? 'Nursery Partner' }}</strong>,
        </p>
        <p style="font-size:14px;color:#475569;margin:0 0 20px">
            Thank you for applying to become a verified vendor on <strong>Nepal Cozy Care</strong>. We have received your application for <strong>{{ $shop->name }}</strong> and our team is currently reviewing your nursery details.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px">
            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#166534;margin:0 0 12px">Application Summary</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 0;font-weight:700;color:#334155;width:150px">Shop / Nursery</td><td style="color:#0f172a">{{ $shop->name }}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#334155">Contact Email</td><td style="color:#0f172a">{{ $shop->email }}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#334155">Phone</td><td style="color:#0f172a">{{ $shop->phone }}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#334155">City / Location</td><td style="color:#0f172a">{{ $shop->address ? $shop->address . ', ' : '' }}{{ $shop->city }}</td></tr>
                @if ($shop->establishment_year)
                    <tr><td style="padding:6px 0;font-weight:700;color:#334155">Est. Year</td><td style="color:#0f172a">{{ $shop->establishment_year }}</td></tr>
                @endif
                <tr><td style="padding:6px 0;font-weight:700;color:#334155">Current Status</td><td><span style="display:inline-block;background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:9999px;font-weight:700;font-size:12px">Pending Review</span></td></tr>
            </table>
        </div>

        <p style="font-size:14px;color:#475569;margin:0 0 16px">
            <strong>What happens next?</strong><br>
            Our administration team typically reviews nursery applications within 1-2 business days. Once approved, you will receive an email confirmation and immediate access to your Seller Portal where you can upload inventory, manage storefront banners, and fulfill orders.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="font-size:12px;color:#94a3b8;margin:0">
            Nepal Cozy Care Plant Studio & Marketplace • Connecting plant lovers with trusted independent growers across Nepal.
        </p>
    </div>
</body>
</html>
