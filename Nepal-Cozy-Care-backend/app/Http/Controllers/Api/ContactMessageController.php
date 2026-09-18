<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendContactNotificationEmail;
use App\Models\ContactMessage;
use App\Services\MailSettingsService;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function store(Request $request, MailSettingsService $mailSettings)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:120',
            'phone' => 'required|string|max:40',
            'city' => 'required|string|max:120',
            'subject' => 'required|in:general_inquiry,order_support,delivery_help,plant_care,bulk_order',
            'preferred_contact_method' => 'required|in:phone,whatsapp,email',
            'order_reference' => 'nullable|string|max:60',
            'message' => 'required|string|max:3000',
        ]);
        $message = ContactMessage::create([
            ...$validated,
            'user_id' => $request->user()?->id,
            'status' => 'new',
        ]);

        $emailDelivery = 'scheduled';
        try {
            $settings = $mailSettings->current();
            $configurationIssues = $mailSettings->configurationIssues($settings);
        } catch (\Throwable $exception) {
            $configurationIssues = ['Email settings could not be read: '.$exception->getMessage()];
        }

        if ($configurationIssues === []) {
            // The SMTP connection happens after the JSON response has reached the browser.
            SendContactNotificationEmail::dispatch($message->id)->afterResponse();
        } else {
            $emailDelivery = 'not_configured';
            $message->update([
                'email_error' => implode(' ', $configurationIssues),
            ]);
        }

        return response()->json([
            'message' => $emailDelivery === 'not_configured'
                ? 'Your message was saved in our support inbox. Email notifications are not configured yet.'
                : 'Message sent successfully. Our team will get back to you soon.',
            'data' => [
                'message_record' => $message->fresh(),
                'email_delivery' => $emailDelivery,
            ],
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $query = ContactMessage::with('user:id,name,email')
            ->latest();
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('city', 'like', '%'.$search.'%')
                    ->orWhere('subject', 'like', '%'.$search.'%')
                    ->orWhere('order_reference', 'like', '%'.$search.'%')
                    ->orWhere('message', 'like', '%'.$search.'%');
            });
        }
        $messages = $query->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'message' => null,
            'data' => [
                'messages' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                    'last_page' => $messages->lastPage(),
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,in_progress,resolved',
        ]);
        $message = ContactMessage::findOrFail($id);
        $message->update([
            'status' => $validated['status'],
            'resolved_at' => $validated['status'] === 'resolved' ? now() : null,
        ]);

        return response()->json([
            'message' => 'Message status updated successfully',
            'data' => [
                'message_record' => $message,
            ],
        ]);
    }

    public function destroy(int $id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully',
        ]);
    }
}
