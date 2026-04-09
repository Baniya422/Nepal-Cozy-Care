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
