<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Seller Application Update</title>
</head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;background:#f8fafc;padding:24px">
    <div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:20px">🌿</span>
            <span style="font-size:16px;font-weight:700;color:#059669;letter-spacing:0.5px">Nepal Cozy Care Marketplace</span>
        </div>
        <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px">Update Regarding Your Seller Application</h1>
        <p style="font-size:15px;color:#334155;margin:0 0 16px">
            Hello <strong>{{ $shop->user?->name ?? 'Applicant' }}</strong>,
        </p>
        <p style="font-size:14px;color:#475569;margin:0 0 20px">
            Thank you for your interest in becoming a vendor for <strong>{{ $shop->name }}</strong> on Nepal Cozy Care. After reviewing your application details, our team is unable to approve your application at this time.
        </p>

        @if ($reason)
            <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:16px;margin-bottom:24px">
                <strong style="font-size:13px;color:#991b1b">Reason / Feedback from Administration:</strong>
                <p style="white-space:pre-wrap;font-size:13px;color:#7f1d1d;margin:8px 0 0">{{ $reason }}</p>
            </div>
        @endif

        <p style="font-size:14px;color:#475569;margin:0 0 16px">
            You are welcome to re-apply with updated business documentation or clarified details at any time from your account profile.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="font-size:12px;color:#94a3b8;margin:0">
            Nepal Cozy Care Plant Studio & Marketplace • Connecting plant lovers with trusted independent growers across Nepal.
        </p>
    </div>
</body>
</html>
