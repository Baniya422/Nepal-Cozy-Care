<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>New contact request</title>
</head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.55;background:#f8fafc;padding:24px">
    <div style="max-width:680px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px">
        <p style="margin:0 0 6px;color:#059669;font-weight:700">Nepal Cozy Care</p>
        <h1 style="font-size:22px;margin:0 0 20px">New contact request</h1>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:6px 0;font-weight:700;width:170px">Name</td><td>{{ $contactMessage->name }}</td></tr>
            <tr><td style="padding:6px 0;font-weight:700">Email</td><td>{{ $contactMessage->email }}</td></tr>
            <tr><td style="padding:6px 0;font-weight:700">Phone</td><td>{{ $contactMessage->phone }}</td></tr>
            <tr><td style="padding:6px 0;font-weight:700">City</td><td>{{ $contactMessage->city }}</td></tr>
            <tr><td style="padding:6px 0;font-weight:700">Subject</td><td>{{ str($contactMessage->subject)->replace('_', ' ')->title() }}</td></tr>
            <tr><td style="padding:6px 0;font-weight:700">Preferred reply</td><td>{{ ucfirst($contactMessage->preferred_contact_method) }}</td></tr>
            @if ($contactMessage->order_reference)
                <tr><td style="padding:6px 0;font-weight:700">Order reference</td><td>{{ $contactMessage->order_reference }}</td></tr>
            @endif
        </table>
        <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px;border-radius:6px">
            <strong>Message</strong>
            <p style="white-space:pre-wrap;margin:8px 0 0">{{ $contactMessage->message }}</p>
        </div>
        <p style="font-size:13px;color:#64748b;margin:20px 0 0">Reply to this email to respond directly to {{ $contactMessage->name }}. The request is also saved in the admin Contact Inbox.</p>
    </div>
</body>
</html>
