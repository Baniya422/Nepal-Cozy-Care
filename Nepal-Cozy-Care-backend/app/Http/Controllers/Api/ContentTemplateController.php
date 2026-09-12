<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentTemplate;

class ContentTemplateController extends Controller
{
    public function show(string $key)
    {
        $template = ContentTemplate::query()
            ->where('key', $key)
            ->where('is_active', true)
            ->latest('id')
            ->first();
        if (! $template) {
            $default = AdminPageContentController::defaultPayload($key);
            if (! empty($default)) {
                return response()->json([
                    'message' => 'Template loaded successfully.',
                    'data' => [
                        'id' => 0,
                        'name' => ucwords(str_replace('_', ' ', $key)),
                        'key' => $key,
                        'payload' => $default,
                    ],
                ]);
            }

            return response()->json([
                'message' => 'Template not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Template loaded successfully.',
            'data' => [
                'id' => $template->id,
                'name' => $template->name,
                'key' => $template->key,
                'payload' => $template->payload,
            ],
        ]);
    }
}
