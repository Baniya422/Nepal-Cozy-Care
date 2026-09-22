<?php

namespace App\Services;

use App\Models\Decoration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageTo3DService
{
    protected ?string $apiKey;
    protected string $provider;

    public function __construct()
    {
        $this->apiKey = config('services.image_to_3d.key') ?? env('MESHY_API_KEY') ?? env('TRIPO_API_KEY');
        $this->provider = env('IMAGE_TO_3D_PROVIDER', 'meshy'); // meshy or tripo
    }

    /**
     * Checks whether an external 3D generation API key is configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Submits an image URL to the 3D generation service.
     */
    public function submitImageGeneration(string $imageUrl, array $metadata = []): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'status' => 'unconfigured',
                'message' => 'Image-to-3D generation is unavailable because an API key (e.g. MESHY_API_KEY) is not configured in .env. Please configure credentials or use manual GLB file upload.',
            ];
        }

        try {
            // Integration with Meshy API v2
            if ($this->provider === 'meshy') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ])->timeout(30)->post('https://api.meshy.ai/v2/image-to-3d', [
                    'image_url' => $imageUrl,
                    'enable_pbr' => true,
                    'should_remesh' => true,
                ]);

                if (!$response->successful()) {
                    Log::error('ImageTo3D Meshy API submission error', ['response' => $response->json()]);
                    return [
                        'success' => false,
                        'message' => $response->json('message') ?? 'Failed to submit 3D generation request.',
                    ];
                }

                $taskId = $response->json('result');

                return [
                    'success' => true,
                    'task_id' => $taskId,
                    'status' => 'IN_PROGRESS',
                    'provider' => 'meshy',
                ];
            }

            return [
                'success' => false,
                'message' => "Unsupported 3D generation provider: {$this->provider}",
            ];
        } catch (\Throwable $e) {
            Log::error('ImageTo3D submission exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Exception occurred during 3D generation dispatch: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Polls or checks status of a submitted 3D task.
     */
    public function checkTaskStatus(string $taskId): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'Provider not configured',
            ];
        }

        try {
            if ($this->provider === 'meshy') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ])->timeout(20)->get("https://api.meshy.ai/v2/image-to-3d/{$taskId}");

                if (!$response->successful()) {
                    return [
                        'success' => false,
                        'message' => 'Could not fetch task status.',
                    ];
                }

                $data = $response->json();
                $status = $data['status'] ?? 'PENDING';
                $glbUrl = $data['model_urls']['glb'] ?? null;
                $thumbnailUrl = $data['thumbnail_url'] ?? null;

                return [
                    'success' => true,
                    'status' => $status,
                    'progress' => $data['progress'] ?? 0,
                    'model_url' => $glbUrl,
                    'thumbnail_url' => $thumbnailUrl,
                ];
            }

            return ['success' => false, 'message' => 'Unsupported provider'];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Downloads the generated GLB and creates a draft decoration in the catalog.
     */
    public function storeGeneratedModel(string $taskId, string $remoteGlbUrl, string $name, array $attributes = []): ?Decoration
    {
        try {
            $response = Http::timeout(60)->get($remoteGlbUrl);
            if (!$response->successful()) {
                Log::error("Failed to download generated GLB model from {$remoteGlbUrl}");
                return null;
            }

            $fileName = 'decorations/generated_' . Str::random(16) . '.glb';
            Storage::disk('public')->put($fileName, $response->body());
            $localModelUrl = Storage::url($fileName);

            return Decoration::create([
                'name' => $name,
                'slug' => Str::slug($name) . '-' . Str::random(4),
                'category' => $attributes['category'] ?? 'decorations',
                'description' => $attributes['description'] ?? 'Generated from single image reference (Draft status).',
                'suitable_room_types' => $attributes['suitable_room_types'] ?? ['living-room', 'office', 'bedroom'],
                'width' => $attributes['width'] ?? 1.0,
                'depth' => $attributes['depth'] ?? 1.0,
                'height' => $attributes['height'] ?? 1.0,
                'model_url' => $localModelUrl,
                'thumbnail_url' => $attributes['thumbnail_url'] ?? null,
                'status' => 'draft', // Generated models remain drafts until explicit admin review and approval
                'source_type' => 'image_to_3d',
            ]);
        } catch (\Throwable $e) {
            Log::error('Error storing generated 3D model: ' . $e->getMessage());
            return null;
        }
    }
}
