import { DEFAULT_BLOG_IMAGE, resolveImageUrl } from "../../utils/imageUrl";
import type { CuratedBlog } from "./curatedBlogs";

export const DEFAULT_AUTHOR_IMAGE = "/images/author-placeholder.svg";
export interface BlogApi {
  id: number;
  title: string;
  content?: string | null;
  excerpt?: string | null;
  image?: string | null;
  author?: string | null;
  author_role?: string | null;
  author_bio?: string | null;
  author_image?: string | null;
  category?: string | null;
  read_time?: string | null;
  views?: number | null;
  published_at?: string | null;
  created_at?: string;
  tags?: string[] | null;
  tips?: string[] | null;
  takeaways?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_published?: boolean;
  is_top_story?: boolean;
  is_top_trend?: boolean;
}

export function mapBlogFromApi(blog: BlogApi): CuratedBlog {
  const content = blog.content || "";
  return {
    id: blog.id, title: blog.title, content,
    excerpt: blog.excerpt || "",
    image: resolveImageUrl(blog.image, DEFAULT_BLOG_IMAGE),
    author: blog.author || "Cozy Care Botanist",
    author_role: blog.author_role || "",
    author_bio: blog.author_bio || "",
    author_image: resolveImageUrl(blog.author_image, DEFAULT_AUTHOR_IMAGE),
    category: blog.category || "General",
    read_time: blog.read_time || `${Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))} min read`,
    views: Number(blog.views) || 0,
    published_at: blog.published_at || blog.created_at || "",
    tags: blog.tags ?? [], tips: blog.tips ?? [], takeaways: blog.takeaways ?? [],
    meta_title: blog.meta_title || "", meta_description: blog.meta_description || "",
    is_featured: Boolean(blog.is_top_story), is_top_trend: Boolean(blog.is_top_trend),
  };
}

const PUBLIC_BLOG_CACHE_TTL = 5 * 60 * 1000;
const publicCacheKey = (url: string) => `cozy:public-blogs:v1:${url}`;

export function readCachedBlogs(url: string): BlogApi[] {
  try {
    const cached = JSON.parse(sessionStorage.getItem(publicCacheKey(url)) || "null");
    if (cached && Date.now() - cached.savedAt < PUBLIC_BLOG_CACHE_TTL &&
        Array.isArray(cached.blogs) && cached.blogs.every((blog: BlogApi) =>
          blog && typeof blog.id === "number" && typeof blog.title === "string")) {
      return cached.blogs;
    }
  } catch { /* Storage may be unavailable. */ }
  return [];
}

export async function fetchPublicBlogs(
  url: string,
  onProgress: (blogs: BlogApi[]) => void,
): Promise<BlogApi[]> {
  const blogs = await fetchAllBlogs(url, undefined, onProgress);
  try {
    sessionStorage.setItem(publicCacheKey(url), JSON.stringify({ savedAt: Date.now(), blogs }));
  } catch { /* A full or disabled cache must not prevent rendering. */ }
  return blogs;
}

export async function fetchAllBlogs(url: string, token?: string | null, onProgress?: (blogs: BlogApi[]) => void): Promise<BlogApi[]> {
  const blogs: BlogApi[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const response = await fetch(`${url}?per_page=100&page=${page}`, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: token ? "no-store" : "default",
    });
    if (!response.ok) throw new Error("Couldn't load articles. Please refresh and try again.");
    const json = await response.json();
    const items = json.data?.blogs ?? json.data?.data ?? json.data;
    if (!Array.isArray(items)) throw new Error("Invalid article response.");
    blogs.push(...items);
    onProgress?.([...blogs]);
    lastPage = Number(json.data?.pagination?.last_page) || 1;
    page++;
  } while (page <= lastPage);
  return blogs;
}

export async function uploadBlogImage(api: string, token: string | null, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("directory", "blogs");
  const response = await fetch(`${api}/api/upload`, {
    method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, body,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Image upload failed. Please try again.");
  const path = json.data?.path || json.path;
  if (typeof path !== "string" || !path.trim()) throw new Error("Image upload did not return a saved image. Please try again.");
  return path;
}
