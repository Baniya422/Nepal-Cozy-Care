<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New order #{{ $order->id }}</title>
</head>
<body style="margin:0;background:#f3f6f4;font-family:Arial,sans-serif;color:#1f2937;line-height:1.55;padding:24px 12px">
    <div style="max-width:700px;margin:auto;background:#ffffff;border:1px solid #dfe8e2;border-radius:16px;overflow:hidden">
        <div style="background:#123b2d;color:#ffffff;padding:26px 28px">
            <p style="margin:0 0 6px;color:#9ce2bc;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Nepal Cozy Care</p>
            <h1 style="font-size:25px;line-height:1.25;margin:0">New order #{{ $order->id }}</h1>
            <p style="margin:8px 0 0;color:#d8eee2">Placed {{ $order->created_at?->format('M j, Y \a\t g:i A') }}</p>
        </div>

        <div style="padding:28px">
            <div style="background:#effaf3;border:1px solid #ccebd8;border-radius:12px;padding:18px;margin-bottom:24px">
                <p style="margin:0 0 3px;color:#527061;font-size:13px">Order total</p>
                <p style="margin:0;color:#123b2d;font-size:26px;font-weight:700">Rs. {{ number_format($order->total, 2) }}</p>
                <p style="margin:5px 0 0;color:#527061;font-size:13px">Cash on Delivery · {{ ucfirst($order->payment_status ?: 'unpaid') }}</p>
            </div>

            <h2 style="font-size:17px;margin:0 0 12px;color:#123b2d">Customer and delivery</h2>
            <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:26px">
                <tr><td style="padding:6px 12px 6px 0;font-weight:700;width:150px;vertical-align:top">Customer</td><td style="padding:6px 0">{{ $order->shipping_name }}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">Email</td><td style="padding:6px 0">{{ $order->user?->email ?: 'Not available' }}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">Phone</td><td style="padding:6px 0">{{ $order->shipping_phone }}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">Delivery address</td><td style="padding:6px 0">{{ $order->shipping_address }}, {{ $order->shipping_city }}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">Preferred contact</td><td style="padding:6px 0">{{ ucfirst($order->preferred_contact_method ?: 'phone') }}</td></tr>
                @if ($order->location_notes)
                    <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">Location notes</td><td style="padding:6px 0">{{ $order->location_notes }}</td></tr>
                @endif
            </table>

            <h2 style="font-size:17px;margin:0 0 12px;color:#123b2d">Items</h2>
            <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e5ebe7;border-radius:10px">
                <thead>
                    <tr style="background:#f7faf8">
                        <th align="left" style="padding:10px 12px;border-bottom:1px solid #e5ebe7">Product</th>
                        <th align="center" style="padding:10px 12px;border-bottom:1px solid #e5ebe7">Qty</th>
                        <th align="right" style="padding:10px 12px;border-bottom:1px solid #e5ebe7">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($order->items as $item)
                        <tr>
                            <td style="padding:11px 12px;border-bottom:1px solid #edf1ee">{{ $item->plant?->name ?: 'Product #'.$item->plant_id }}</td>
                            <td align="center" style="padding:11px 12px;border-bottom:1px solid #edf1ee">{{ $item->quantity }}</td>
                            <td align="right" style="padding:11px 12px;border-bottom:1px solid #edf1ee">Rs. {{ number_format($item->line_total, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr><td colspan="2" align="right" style="padding:8px 12px 3px;color:#64748b">Subtotal</td><td align="right" style="padding:8px 12px 3px">Rs. {{ number_format($order->subtotal, 2) }}</td></tr>
                    <tr><td colspan="2" align="right" style="padding:3px 12px;color:#64748b">Tax</td><td align="right" style="padding:3px 12px">Rs. {{ number_format($order->tax, 2) }}</td></tr>
                    <tr><td colspan="2" align="right" style="padding:3px 12px 12px;font-weight:700;color:#123b2d">Total</td><td align="right" style="padding:3px 12px 12px;font-weight:700;color:#123b2d">Rs. {{ number_format($order->total, 2) }}</td></tr>
                </tfoot>
            </table>

            <p style="font-size:13px;color:#64748b;margin:22px 0 0">This notification was sent to the recipient configured in Admin Settings. Replying will address the customer when their email is available.</p>
        </div>
    </div>
</body>
</html>
