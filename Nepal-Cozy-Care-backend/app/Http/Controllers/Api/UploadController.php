<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload a file to storage.
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
            $extension = $file->getClientOriginalExtension();
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $originalName);
            $filename = $safeName.'_'.time().'_'.uniqid().'.'.$extension;
            $path = $file->storeAs($directory, $filename, 'public');

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
