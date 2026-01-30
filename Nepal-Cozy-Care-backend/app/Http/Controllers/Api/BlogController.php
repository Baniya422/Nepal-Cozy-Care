<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    // Public: list published blogs, with optional search
    public function index(Request $request)
    {
        $query = Blog::query()
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('content', 'like', '%' . $search . '%');
            });
        }

        $perPage = (int) $request->query('per_page', 10);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => null,
            'data' => [
                'blogs' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    // Public: show a single published blog by id
    public function show(int $id)
    {
        $blog = Blog::where('is_published', true)
            ->findOrFail($id);

        return response()->json([
            'message' => null,
            'data' => [
                'blog' => $blog,
            ],
        ]);
    }

    // Admin: create a blog article
    public function store(StoreBlogRequest $request)
    {
        $validated = $request->validated();

        $slug = $validated['slug'] ?? Str::slug($validated['title']);

        // ensure slug unique
        if (Blog::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . Str::random(6);
        }

        $isPublished = (bool) ($validated['is_published'] ?? false);

        $blog = Blog::create([
            'user_id' => $request->user()->id ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'image' => $validated['image'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);

        return response()->json([
            'message' => 'Blog article created',
            'blog' => $blog,
        ], 201);
    }

    // Admin: update a blog article
    public function update(UpdateBlogRequest $request, int $id)
    {
        $blog = Blog::findOrFail($id);

        $validated = $request->validated();

        if (! empty($validated['title']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if (array_key_exists('is_published', $validated)) {
            $isPublished = (bool) $validated['is_published'];
            if ($isPublished && ! $blog->published_at) {
                $validated['published_at'] = now();
            }
            if (! $isPublished) {
                $validated['published_at'] = null;
            }
        }

        $blog->update($validated);

        return response()->json([
            'message' => 'Blog article updated',
            'data' => [
                'blog' => $blog,
            ],
        ]);
    }

    // Admin: delete blog article
    public function destroy(int $id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();

        return response()->json([
            'message' => 'Blog article deleted',
        ]);
    }
}

