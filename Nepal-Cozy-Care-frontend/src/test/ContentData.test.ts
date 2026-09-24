import { afterEach, describe, expect, it, vi } from "vitest";
import { getProductPricing } from "../utils/productPricing";
import { fetchPlantFinderCatalog } from "../features/plant-finder/catalog";
import { getAIPlantRecommendations } from "../features/plant-finder/aiMatchmaker";
import { fetchAllBlogs, mapBlogFromApi, DEFAULT_AUTHOR_IMAGE } from "../features/blogs/blogData";
import { parseArticleSections } from "../features/blogs/articleContent";

afterEach(() => vi.unstubAllGlobals());

describe("saved content", () => {
  it("calculates the original price using the saved discount", () => {
    expect(getProductPricing(850, 15)).toEqual({ sellingPrice: 850, discountPercent: 15, originalPrice: 1000 });
    expect(getProductPricing(850)).toEqual({ sellingPrice: 850, discountPercent: 0, originalPrice: 850 });
  });

  it("loads all plant pages and recommends a newly added matching plant", async () => {
    const newPlant = { id: 102, name: "New office plant", price: 850, category: "Indoor Plants", light: "Bright Indirect", humidity: "Drier Air", difficulty: "Beginner Friendly", rooms: ["Home Office"] };
    const fetchMock = vi.fn(async (url: string) => new Response(JSON.stringify({ data: {
      plants: url.endsWith("page=1") ? [{ id: 1, name: "Pot", price: 20, category: "Pots & Planters" }] : [newPlant],
      pagination: { last_page: 2 },
    } })));
    vi.stubGlobal("fetch", fetchMock);
    const plants = await fetchPlantFinderCatalog("http://api");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const results = getAIPlantRecommendations(plants, { room: "office", light: "indirect-light", experience: "beginner", location: "dry" });
    expect(results.recommendedPlants.map((plant) => plant.id)).toEqual([102]);
    expect(results.recommendedPlants[0].aiHighlights).toContain("Filtered Sun Fan");
    await fetchPlantFinderCatalog("http://api");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("does not substitute sample plants on a failed or empty catalog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
    await expect(fetchPlantFinderCatalog("http://api")).rejects.toThrow();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { plants: [] } }))));
    expect(await fetchPlantFinderCatalog("http://api")).toEqual([]);
  });

  it("preserves writer profiles and article sections without sample replacements", () => {
    const blog = mapBlogFromApi({ id: 3, title: "Saved article", content: "Real content", author: "Priya", author_image: "blogs/priya.webp", author_role: "Horticulturist", author_bio: "Real biography", read_time: "8 min read", tags: ["Care"], tips: ["Check soil"], takeaways: [], views: 0 });
    expect(blog.author_image).toContain("/storage/blogs/priya.webp");
    expect(blog).toMatchObject({ author: "Priya", author_role: "Horticulturist", author_bio: "Real biography", read_time: "8 min read", tags: ["Care"], tips: ["Check soil"], takeaways: [], views: 0 });
    const empty = mapBlogFromApi({ id: 3, title: "Minimal article" });
    expect(empty.author_image).toBe(DEFAULT_AUTHOR_IMAGE);
    expect(empty.tips).toEqual([]);
    expect(empty.author_bio).toBe("");
  });

  it("loads older admin articles beyond the first page", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => new Response(JSON.stringify({ data: {
      blogs: [{ id: url.endsWith("page=1") ? 20 : 3, title: "Article" }], pagination: { last_page: 2 },
    } }))));
    expect((await fetchAllBlogs("http://api/api/admin/blogs", "token")).map((blog) => blog.id)).toEqual([20, 3]);
  });

  it("keeps the first heading and paragraphs when there is no introduction", () => {
    expect(parseArticleSections("## First heading\nFirst paragraph\n\nSecond paragraph\n\n### Next heading\n- One\n- Two")).toEqual([
      { heading: "First heading", paras: ["First paragraph", "Second paragraph"] },
      { heading: "Next heading", paras: ["- One\n- Two"] },
    ]);
  });
});
