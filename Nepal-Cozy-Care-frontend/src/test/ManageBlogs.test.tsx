import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ManageBlogs from "../pages/admin/ManageBlogs";

vi.mock("../components/admin/AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("blog image saving", () => {
  beforeEach(() => {
    vi.stubGlobal("scrollTo", vi.fn());
    URL.createObjectURL = vi.fn(() => "blob:preview");
    localStorage.setItem("token", "test-token");
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([false, true])("handles upload success=%s without silently keeping the old image", async (success) => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/api/upload")) {
        return new Response(JSON.stringify(success
          ? { data: { path: "blogs/new-cover.webp" } }
          : { message: "Image upload failed" }), { status: success ? 201 : 422 });
      }
      if (options?.method === "POST") return new Response("{}", { status: 201 });
      return new Response(JSON.stringify({ data: { blogs: [] } }));
    });
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ManageBlogs />);
    fireEvent.click(await screen.findByRole("button", { name: "Create New Blog" }));
    fireEvent.change(screen.getByPlaceholderText(/Ultimate Monstera/), { target: { value: "New article" } });
    fireEvent.change(screen.getByPlaceholderText(/Write your article/), { target: { value: "Article content" } });
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["image"], "cover.png", { type: "image/png" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish Article" }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => url.endsWith("/api/upload"))).toBe(true));
    if (success) {
      await waitFor(() => expect(fetchMock.mock.calls.some(([, options]) =>
        typeof options?.body === "string" && JSON.parse(options.body).image === "blogs/new-cover.webp"
      )).toBe(true));
    } else {
      expect(await screen.findByText("Image upload failed")).toBeInTheDocument();
      expect(fetchMock.mock.calls.filter(([url, options]) => url.endsWith("/api/admin/blogs") && options?.method === "POST")).toHaveLength(0);
    }
  });
});
