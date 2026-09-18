<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function __construct(
        protected ImageCompressionService $compressionService
    ) {}

    /**
     * Upload a file to storage with automatic compression.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'directory' => 'nullable|string',
        ]);
        try {
            $file = $request->file('file');
            $directory = $request->input('directory', 'uploads');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $originalName);

            // Compress image if applicable
            $compressedPath = $this->compressionService->compress($file);
            $isWebp = str_ends_with($compressedPath, '.webp');
            $extension = $isWebp ? 'webp' : $file->getClientOriginalExtension();
            $filename = $safeName.'_'.time().'_'.uniqid().'.'.$extension;

            if ($compressedPath !== $file->getRealPath() && file_exists($compressedPath)) {
                $storagePath = $directory.'/'.$filename;
                Storage::disk('public')->put($storagePath, file_get_contents($compressedPath));
                @unlink($compressedPath);
                $path = $storagePath;
            } else {
                $path = $file->storeAs($directory, $filename, 'public');
            }

            return response()->json([
                'message' => 'File uploaded successfully',
                'data' => [
                    'path' => $path,
                    'url' => Storage::url($path),
                    'filename' => $filename,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'File upload failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
