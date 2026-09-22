<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Decoration;
use App\Services\ImageTo3DService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DecorationController extends Controller
{
    protected ImageTo3DService $imageTo3dService;

    public function __construct(ImageTo3DService $imageTo3dService)
    {
        $this->imageTo3dService = $imageTo3dService;
    }

    /**
     * Public catalog endpoint for Room Designer.
     * Returns ONLY published decorations.
     */
    public function index(Request $request)
    {
        $query = Decoration::published();

        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        if ($request->has('room') && !empty($request->room)) {
            $room = $request->room;
            $query->where(function ($q) use ($room) {
                $q->whereJsonContains('suitable_room_types', $room)
                  ->orWhereNull('suitable_room_types');
            });
        }

        $decorations = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $decorations,
        ]);
    }

    /**
     * Admin: List all decorations (published, draft, archived)
     */
    public function adminIndex(Request $request)
    {
        $query = Decoration::query();

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('category') && !empty($request->category) && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $decorations = $query->latest()->paginate($request->input('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $decorations,
        ]);
    }

    /**
     * Admin: Store new decoration with model and thumbnail upload.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:plants,furniture,pots,decorations',
            'description' => 'nullable|string|max:1000',
            'suitable_room_types' => 'nullable|array',
            'width' => 'nullable|numeric|min:0.1|max:15.0',
            'depth' => 'nullable|numeric|min:0.1|max:15.0',
            'height' => 'nullable|numeric|min:0.1|max:15.0',
            'default_color' => 'nullable|string|max:20',
            'model_scale' => 'nullable|numeric|min:0.1|max:10.0',
            'model_rotation_offset' => 'nullable|numeric',
            'floor_alignment' => 'nullable|string|in:floor,tabletop,wall',
            'plant_id' => 'nullable|exists:plants,id',
            'product_id' => 'nullable|integer',
            'status' => 'nullable|string|in:draft,published,archived',
            'thumbnail' => 'nullable|image|max:5120', // 5MB
            'model_file' => 'nullable|file|max:25600', // 25MB GLB
        ]);

        $modelUrl = null;
        $thumbnailUrl = null;

        // Handle GLB 3D model file upload
        if ($request->hasFile('model_file')) {
            $file = $request->file('model_file');
            $extension = strtolower($file->getClientOriginalExtension());
            if ($extension !== 'glb') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Uploaded 3D model must be a self-contained .glb binary format.',
                ], 422);
            }
            $path = $file->store('decorations/models', 'public');
            $modelUrl = Storage::url($path);
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('decorations/thumbnails', 'public');
            $thumbnailUrl = Storage::url($path);
        }

        $decoration = Decoration::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4),
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'suitable_room_types' => $validated['suitable_room_types'] ?? ['living-room', 'office', 'bedroom'],
            'width' => $validated['width'] ?? 1.0,
            'depth' => $validated['depth'] ?? 1.0,
            'height' => $validated['height'] ?? 1.0,
            'default_color' => $validated['default_color'] ?? '#276749',
            'thumbnail_url' => $thumbnailUrl,
            'model_url' => $modelUrl,
            'model_scale' => $validated['model_scale'] ?? 1.0,
            'model_rotation_offset' => $validated['model_rotation_offset'] ?? 0.0,
            'floor_alignment' => $validated['floor_alignment'] ?? 'floor',
            'plant_id' => $validated['plant_id'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'source_type' => 'manual_upload',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Decoration created successfully.',
            'data' => $decoration,
        ], 201);
    }

    /**
     * Admin: Show decoration
     */
    public function show($id)
    {
        $decoration = Decoration::with('plant')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $decoration,
        ]);
    }

    /**
     * Admin: Update decoration
     */
    public function update(Request $request, $id)
    {
        $decoration = Decoration::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|in:plants,furniture,pots,decorations',
            'description' => 'nullable|string|max:1000',
            'suitable_room_types' => 'nullable|array',
            'width' => 'nullable|numeric|min:0.1|max:15.0',
            'depth' => 'nullable|numeric|min:0.1|max:15.0',
            'height' => 'nullable|numeric|min:0.1|max:15.0',
            'default_color' => 'nullable|string|max:20',
            'model_scale' => 'nullable|numeric|min:0.1|max:10.0',
            'model_rotation_offset' => 'nullable|numeric',
            'floor_alignment' => 'nullable|string|in:floor,tabletop,wall',
            'plant_id' => 'nullable|exists:plants,id',
            'product_id' => 'nullable|integer',
            'status' => 'nullable|string|in:draft,published,archived',
            'thumbnail' => 'nullable|image|max:5120',
            'model_file' => 'nullable|file|max:25600',
        ]);

        if ($request->hasFile('model_file')) {
            $file = $request->file('model_file');
            $extension = strtolower($file->getClientOriginalExtension());
            if ($extension !== 'glb') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Uploaded 3D model must be a self-contained .glb binary format.',
                ], 422);
            }
            $path = $file->store('decorations/models', 'public');
            $validated['model_url'] = Storage::url($path);
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('decorations/thumbnails', 'public');
            $validated['thumbnail_url'] = Storage::url($path);
        }

        $decoration->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Decoration updated successfully.',
            'data' => $decoration,
        ]);
    }

    /**
     * Admin: Publish item
     */
    public function publish($id)
    {
        $decoration = Decoration::findOrFail($id);
        $decoration->update(['status' => 'published']);

        return response()->json([
            'status' => 'success',
            'message' => "Decoration '{$decoration->name}' is now published to the public Room Designer.",
            'data' => $decoration,
        ]);
    }

    /**
     * Admin: Archive item
     */
    public function archive($id)
    {
        $decoration = Decoration::findOrFail($id);
        $decoration->update(['status' => 'archived']);

        return response()->json([
            'status' => 'success',
            'message' => "Decoration '{$decoration->name}' archived.",
            'data' => $decoration,
        ]);
    }

    /**
     * Admin: Delete item
     */
    public function destroy($id)
    {
        $decoration = Decoration::findOrFail($id);
        $decoration->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Decoration deleted successfully.',
        ]);
    }

    /**
     * Admin: Get status of Image-to-3D service configuration
     */
    public function imageTo3dStatus()
    {
        $configured = $this->imageTo3dService->isConfigured();

        return response()->json([
            'status' => 'success',
            'data' => [
                'is_configured' => $configured,
                'provider' => env('IMAGE_TO_3D_PROVIDER', 'meshy'),
                'notice' => $configured
                    ? 'Image-to-3D service is active.'
                    : 'Image-to-3D provider API key is not configured in backend .env. Manual GLB upload is fully active.',
            ],
        ]);
    }
}
