<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>New Seller Application</title>
</head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;background:#f8fafc;padding:24px">
    <div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:20px">🌿</span>
            <span style="font-size:16px;font-weight:700;color:#059669;letter-spacing:0.5px">Nepal Cozy Care Administration</span>
        </div>
        <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px">New Nursery / Seller Application</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 20px">
            A new nursery partner has submitted an application to become a vendor on the Nepal Cozy Care marketplace.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px">
            <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#0f172a;margin:0 0 12px">Nursery Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 0;font-weight:700;color:#475569;width:150px">Shop Name</td><td style="color:#0f172a"><strong>{{ $shop->name }}</strong></td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#475569">Applicant User</td><td style="color:#0f172a">{{ $shop->user?->name ?? 'User #' . $shop->user_id }} ({{ $shop->user?->email }})</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#475569">Shop Email</td><td style="color:#0f172a">{{ $shop->email }}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#475569">Phone</td><td style="color:#0f172a">{{ $shop->phone }}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;color:#475569">City / Address</td><td style="color:#0f172a">{{ $shop->address ? $shop->address . ', ' : '' }}{{ $shop->city }}</td></tr>
                @if ($shop->website)
                    <tr><td style="padding:6px 0;font-weight:700;color:#475569">Website</td><td style="color:#0f172a">{{ $shop->website }}</td></tr>
                @endif
                @if ($shop->short_description)
                    <tr><td style="padding:6px 0;font-weight:700;color:#475569">Tagline</td><td style="color:#0f172a">{{ $shop->short_description }}</td></tr>
                @endif
            </table>

            @if ($shop->description)
                <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0">
                    <strong style="font-size:13px;color:#475569">Nursery Description / Background:</strong>
                    <p style="white-space:pre-wrap;font-size:13px;color:#334155;margin:6px 0 0">{{ $shop->description }}</p>
                </div>
            @endif
        </div>

        <p style="font-size:14px;color:#475569;margin:0 0 16px">
            You can review, approve, or reject this application directly from the <strong>Admin Dashboard &gt; Seller Applications</strong> panel.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="font-size:12px;color:#94a3b8;margin:0">
            Nepal Cozy Care Automated Administration System
        </p>
    </div>
</body>
</html>
