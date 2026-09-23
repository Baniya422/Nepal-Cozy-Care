<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HelpCenterTemplate;
use App\Support\PageContentDefaults;

class HelpCenterTemplateController extends Controller
{
    public function show()
    {
        $template = HelpCenterTemplate::query()
            ->where('is_active', true)
            ->latest('id')
            ->first();
        $default = PageContentDefaults::helpCenter();

        if (! $template) {
            return response()->json([
                'message' => 'Help center template loaded successfully.',
                'data' => $default,
            ]);
        }

        return response()->json([
            'message' => 'Help center template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name ?: $default['name'],
                'categories' => ! empty($template->categories) ? $template->categories : $default['categories'],
                'faq_items' => ! empty($template->faq_items) ? $template->faq_items : $default['faq_items'],
                'topic_cards' => ! empty($template->topic_cards) ? $template->topic_cards : $default['topic_cards'],
                'support_intro' => $template->support_intro ?: $default['support_intro'],
                'contact_phone' => $template->contact_phone ?: $default['contact_phone'],
                'contact_email' => $template->contact_email ?: $default['contact_email'],
            ],
        ]);
    }
}
