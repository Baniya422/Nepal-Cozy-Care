const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const DEFAULT_PLANT_IMAGE = "/images/mos.jpg";
export const DEFAULT_POT_IMAGE = "/images/pot1.jpg";
export const DEFAULT_BLOG_IMAGE = "/images/blog-hero-lush.jpg";
export const DEFAULT_CARE_TIP_IMAGE = "/images/blog-leaf-macro.jpg";

/**
 * Resolves an image path from backend or frontend public folder.
 * 1. If empty or invalid, returns fallback.
 * 2. If it starts with "http://" or "https://" or "data:", returns as is.
 * 3. If it starts with "/images/" or "images/", it's a frontend public asset.
 * 4. If it starts with "/" but not "/images/", returns as is.
 * 5. If it's a backend storage path (e.g. "plants/...", "blogs/...", "care-tips/..."),
 *    returns `${API}/storage/${trimmed}`.
 */
export function resolveImageUrl(
  imagePath?: string | null,
  fallback: string = DEFAULT_PLANT_IMAGE
): string {
  if (!imagePath || typeof imagePath !== "string") {
    return fallback;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return fallback;
  }

  // Absolute URLs or data URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("//")
  ) {
    return trimmed;
  }

  // Already prefixed with /storage/
  if (trimmed.startsWith("/storage/")) {
    return `${API}${trimmed}`;
  }

  // Frontend public image paths
  if (trimmed.startsWith("/images/")) {
    return trimmed;
  }
  if (trimmed.startsWith("images/")) {
    return `/${trimmed}`;
  }

  // If path starts with a slash, it's a root-relative public asset
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // If it's just a file name like "mos.jpg" or "pot1.jpg"
  if (!trimmed.includes("/")) {
    // Check if it's a known frontend image
    const knownImages = [
      "mos.jpg",
      "snake.jpg",
      "rubber.jpg",
      "alovera.jpg",
      "lily.jpg",
      "spider.jpg",
      "pothos.jpg",
      "fiddle.jpg",
      "palm.jpg",
      "zzplant.jpg",
      "jade.jpg",
      "pot1.jpg",
      "pot2.jpg",
      "pot3.webp",
      "pot4.jpg",
      "can.jpg",
      "sovel.webp",
      "about-plants.jpg",
      "blog-hero-lush.jpg",
      "blog-leaf-macro.jpg",
      "winter-garden.png",
      "about-story.jpg",
      "about-hero.jpg",
      "team-sarah.jpg",
      "team-michael.jpg",
      "team-emily.jpg",
      "team-david.jpg",
      "Ceramic Plant Pot.jpg",
    ];

    if (knownImages.includes(trimmed)) {
      return `/images/${trimmed}`;
    }
  }

  // Stored in backend Laravel storage (e.g. "plants/xxx.jpg", "blogs/xxx.jpg")
  return `${API}/storage/${trimmed}`;
}

/**
 * Image error handler helper that resets src to fallback once
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_PLANT_IMAGE
) {
  const target = e.currentTarget;
  if (target.getAttribute("data-fallback-applied")) {
    return;
  }
  target.setAttribute("data-fallback-applied", "true");
  target.src = fallback;
}
