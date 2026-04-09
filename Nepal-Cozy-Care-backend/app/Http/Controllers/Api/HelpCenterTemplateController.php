<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HelpCenterTemplate;

class HelpCenterTemplateController extends Controller
{
    public function show()
    {
        $template = HelpCenterTemplate::query()
            ->where('is_active', true)
            ->latest('id')
            ->first();

        if (! $template) {
            return response()->json([
                'message' => 'No active help center template found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Help center template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name,
                'categories' => $template->categories,
                'faq_items' => $template->faq_items,
                'topic_cards' => $template->topic_cards,
                'support_intro' => $template->support_intro,
                'contact_phone' => $template->contact_phone,
                'contact_email' => $template->contact_email,
            ],
        ]);
    }
}
