<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    private const LIST_COLUMNS = [
        'id', 'user_id', 'title', 'slug', 'excerpt', 'image',
        'author', 'author_role', 'author_bio', 'author_image',
        'read_time', 'tags', 'tips', 'takeaways', 'category',
        'meta_title', 'meta_description', 'views', 'is_published',
        'published_at', 'created_at', 'is_top_trend', 'is_top_story'
    ];

    private function clearBlogCache(): void
    {
        try {
            if (! Cache::has('blog_cache_version')) {
                Cache::forever('blog_cache_version', 1);
            } else {
                Cache::increment('blog_cache_version');
            }
        } catch (\Throwable) {
            // Non-blocking fallback
        }
    }

    public function adminIndex(Request $request)
    {
        $query = Blog::query()
            ->orderByDesc('created_at');
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')
                    ->orWhere('content', 'like', '%'.$search.'%');
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

    public function index(Request $request)
    {
        $perPage = min(100, max(1, (int) $request->query('per_page', 10)));
        $page = max(1, (int) $request->query('page', 1));
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));

        $version = (int) Cache::get('blog_cache_version', 1);
        $cacheKey = "public_blogs_v{$version}_p{$page}_l{$perPage}_" . md5($category . '_' . $search);

        $payload = Cache::remember($cacheKey, 300, function () use ($search, $category, $perPage) {
            $query = Blog::query()
                ->select(self::LIST_COLUMNS)
                ->where('is_published', true)
                ->orderByDesc('published_at')
                ->orderByDesc('created_at');

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%'.$search.'%')
                        ->orWhere('excerpt', 'like', '%'.$search.'%');
                });
            }

            if ($category !== '' && strtolower($category) !== 'all') {
                $query->where('category', $category);
            }

            $paginator = $query->paginate($perPage);

            return [
                'blogs' => $paginator->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ];
        });

        return response()->json([
            'message' => null,
            'data' => $payload,
        ])->header('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    }

    public function show(int $id)
    {
        $blog = Blog::where('is_published', true)
            ->findOrFail($id);
        $blog->increment('views');
        $relatedBlogs = Blog::where('is_published', true)
            ->where('id', '!=', $blog->id)
            ->where(function ($query) use ($blog) {
                $query->where('category', $blog->category)
                    ->orWhere('author', $blog->author);
            })
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'blog' => $blog->fresh(),
                'related_blogs' => $relatedBlogs,
            ],
        ]);
    }

    public function topTrends(Request $request)
    {
        $limit = (int) $request->query('limit', 5);
        $blogs = Blog::where('is_published', true)
            ->orderByRaw('is_top_trend DESC')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'blogs' => $blogs,
            ],
        ]);
    }

    public function topStories(Request $request)
    {
        $limit = (int) $request->query('limit', 5);
        $blogs = Blog::where('is_published', true)
            ->orderByRaw('is_top_story DESC')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'blogs' => $blogs,
            ],
        ]);
    }

    public function store(StoreBlogRequest $request)
    {
        $validated = $request->validated();
        $slug = $validated['slug'] ?? Str::slug($validated['title']);
        if (Blog::where('slug', $slug)->exists()) {
            $slug = $slug.'-'.Str::random(6);
        }
        $isPublished = (bool) ($validated['is_published'] ?? false);
        $image = $validated['image'] ?? null;
        if ($request->hasFile('image')) {
            $image = $request->file('image')->store('blogs', 'public');
        }
        $blog = Blog::create([
            ...$validated,
            'user_id' => $request->user()?->id ?? 1,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'image' => $image,
            'author' => $validated['author'] ?? 'Cozy Care Botanist',
            'category' => $validated['category'] ?? 'Indoor Plants',
            'is_top_trend' => (bool) ($validated['is_top_trend'] ?? false),
            'is_top_story' => (bool) ($validated['is_top_story'] ?? false),
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);
        $this->clearBlogCache();

        return response()->json([
            'message' => 'Blog article created',
            'blog' => $blog,
        ], 201);
    }

    public function update(UpdateBlogRequest $request, int $id)
    {
        $blog = Blog::findOrFail($id);
        $validated = $request->validated();
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('blogs', 'public');
        }
        if (! empty($validated['title']) && empty($validated['slug'])) {
            $newSlug = Str::slug($validated['title']);
            if ($newSlug !== $blog->slug) {
                $slugExists = Blog::where('slug', $newSlug)
                    ->where('id', '!=', $id)
                    ->exists();
                if ($slugExists) {
                    $validated['slug'] = $newSlug.'-'.time();
                } else {
                    $validated['slug'] = $newSlug;
                }
            }
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
        $this->clearBlogCache();

        return response()->json([
            'message' => 'Blog article updated',
            'data' => [
                'blog' => $blog,
            ],
        ]);
    }

    public function destroy(int $id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();
        $this->clearBlogCache();

        return response()->json([
            'message' => 'Blog article deleted',
        ]);
    }
}
