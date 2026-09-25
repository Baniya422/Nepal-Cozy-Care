import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import Blogs from "../pages/Blogs";
import { fetchPublicBlogs, readCachedBlogs } from "../features/blogs/blogData";

vi.mock("../components/layout/Layout", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
const article = { id: 7, title: "Featured garden guide", is_top_story: true, image: "/images/blog-hero-lush.jpg" };
const response = (blogs: unknown[], last_page = 1) => ({ ok: true, json: async () => ({ data: { blogs, pagination: { last_page } } }) });
const api = `${import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/blogs`;
beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("shows the featured story before remaining blog pages finish", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response([article], 2)).mockImplementation(() => new Promise(() => {})));
  render(<MemoryRouter><Blogs /></MemoryRouter>);
  expect(await screen.findByRole("heading", { level: 1, name: article.title })).toBeInTheDocument();
  expect(screen.getByAltText(article.title)).toHaveAttribute("fetchpriority", "high");
});

it("shows recently loaded featured content immediately while refreshing", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([article])));
  await fetchPublicBlogs(api, () => {});
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  render(<MemoryRouter><Blogs /></MemoryRouter>);
  expect(screen.getByRole("heading", { level: 1, name: article.title })).toBeInTheDocument();
});

it("expires cached content and replaces it after an empty live response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response([article])).mockResolvedValueOnce(response([])));
  await fetchPublicBlogs(api, () => {});
  const now = Date.now();
  vi.spyOn(Date, "now").mockReturnValue(now + 6 * 60 * 1000);
  expect(readCachedBlogs(api)).toEqual([]);
  await fetchPublicBlogs(api, () => {});
  expect(readCachedBlogs(api)).toEqual([]);
});
