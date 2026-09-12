<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentTemplate;
use App\Support\HomepageDefaults;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HomepageContentController extends Controller
{
    public function show()
    {
        return response()->json([
            'message' => 'Homepage content loaded successfully.',
            'data' => [
                'payload' => $this->payload(),
            ],
        ]);
    }

    public function adminShow()
    {
        $template = ContentTemplate::query()->where('key', 'home_page')->first();

        return response()->json([
            'message' => 'Homepage content loaded successfully.',
            'data' => [
                'id' => $template?->id,
                'name' => $template?->name ?? 'Home Page',
                'payload' => $this->payload($template),
                'updated_at' => $template?->updated_at,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate($this->rules());
        $encoded = json_encode($validated['payload']);
        if ($encoded === false || strlen($encoded) > 150000) {
            throw ValidationException::withMessages([
                'payload' => ['Homepage content must be valid and smaller than 150 KB.'],
            ]);
        }

        $payload = array_replace_recursive(HomepageDefaults::get(), $validated['payload']);
        $template = ContentTemplate::query()->updateOrCreate(
            ['key' => 'home_page'],
            [
                'name' => 'Home Page',
                'is_active' => true,
                'payload' => $payload,
            ]
        );

        return response()->json([
            'message' => 'Homepage content updated successfully.',
            'data' => [
                'id' => $template->id,
                'payload' => $template->payload,
                'updated_at' => $template->updated_at,
            ],
        ]);
    }

    private function payload(?ContentTemplate $template = null): array
    {
        $template ??= ContentTemplate::query()
            ->where('key', 'home_page')
            ->where('is_active', true)
            ->first();

        return array_replace_recursive(HomepageDefaults::get(), $template?->payload ?? []);
    }

    private function rules(): array
    {
        $shortText = ['sometimes', 'string', 'max:255'];
        $longText = ['sometimes', 'string', 'max:5000'];
        $path = ['sometimes', 'string', 'max:1000'];

        return [
            'payload' => ['required', 'array'],
            'payload.hero' => ['sometimes', 'array'],
            'payload.hero.background_image' => $path,
            'payload.hero.badge' => $shortText,
            'payload.hero.title' => $shortText,
            'payload.hero.description' => $longText,
            'payload.hero.primary_cta' => ['sometimes', 'array'],
            'payload.hero.primary_cta.label' => $shortText,
            'payload.hero.primary_cta.path' => $path,
            'payload.hero.secondary_cta' => ['sometimes', 'array'],
            'payload.hero.secondary_cta.label' => $shortText,
            'payload.hero.secondary_cta.path' => $path,
            'payload.hero.highlights' => ['sometimes', 'array', 'max:6'],
            'payload.hero.highlights.*' => $shortText,
            'payload.hero.side_kicker' => $shortText,
            'payload.hero.side_title' => $shortText,
            'payload.hero.side_description' => $longText,
            'payload.hero.side_points' => ['sometimes', 'array', 'max:6'],
            'payload.hero.side_points.*' => ['array'],
            'payload.hero.side_points.*.title' => $shortText,
            'payload.hero.side_points.*.description' => $longText,
            'payload.features' => ['sometimes', 'array', 'max:6'],
            'payload.features.*' => ['array'],
            'payload.features.*.title' => $shortText,
            'payload.features.*.description' => $longText,
            'payload.smart_tools' => ['sometimes', 'array'],
            'payload.smart_tools.kicker' => $shortText,
            'payload.smart_tools.title' => $shortText,
            'payload.smart_tools.description' => $longText,
            'payload.smart_tools.items' => ['sometimes', 'array', 'max:6'],
            'payload.smart_tools.items.*' => ['array'],
            'payload.smart_tools.items.*.title' => $shortText,
            'payload.smart_tools.items.*.description' => $longText,
            'payload.smart_tools.items.*.action' => $shortText,
            'payload.smart_tools.items.*.path' => $path,
            'payload.seasonal' => ['sometimes', 'array'],
            'payload.seasonal.kicker' => $shortText,
            'payload.seasonal.title' => $shortText,
            'payload.seasonal.description' => $longText,
            'payload.seasonal.badge_suffix' => $shortText,
            'payload.seasonal.empty_title_suffix' => $shortText,
            'payload.seasonal.empty_description' => $longText,
            'payload.seasonal.primary_cta' => ['sometimes', 'array'],
            'payload.seasonal.primary_cta.label' => $shortText,
            'payload.seasonal.primary_cta.path' => $path,
            'payload.seasonal.secondary_cta' => ['sometimes', 'array'],
            'payload.seasonal.secondary_cta.label' => $shortText,
            'payload.seasonal.secondary_cta.path' => $path,
            'payload.seasonal.empty_action' => ['sometimes', 'array'],
            'payload.seasonal.empty_action.label' => $shortText,
            'payload.seasonal.empty_action.path' => $path,
            'payload.product_sections' => ['sometimes', 'array'],
            'payload.product_sections.*' => ['array'],
            'payload.product_sections.*.title' => $shortText,
            'payload.product_sections.*.empty_message' => $longText,
            'payload.product_sections.*.button_label' => $shortText,
            'payload.product_sections.*.button_path' => $path,
            'payload.garden' => ['sometimes', 'array'],
            'payload.garden.title' => $shortText,
            'payload.garden.description' => $longText,
            'payload.garden.button_label' => $shortText,
            'payload.garden.button_path' => $path,
            'payload.garden.image' => $path,
            'payload.garden.image_alt' => $shortText,
            'payload.mission' => ['sometimes', 'array'],
            'payload.mission.title' => $shortText,
            'payload.mission.description' => $longText,
            'payload.mission.button_label' => $shortText,
            'payload.mission.button_path' => $path,
            'payload.mission.image' => $path,
            'payload.mission.image_alt' => $shortText,
            'payload.about' => ['sometimes', 'array'],
            'payload.about.title' => $shortText,
            'payload.about.description' => $longText,
            'payload.about.button_label' => $shortText,
            'payload.about.button_path' => $path,
        ];
    }
}
