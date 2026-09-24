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
    URL.revokeObjectURL = vi.fn();
    localStorage.setItem("token", "test-token");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uploads a writer photo and saves the full profile and article details", async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/api/upload")) return new Response(JSON.stringify({ data: { path: "blogs/writer.webp" } }), { status: 201 });
      if (options?.method === "POST") return new Response("{}", { status: 201 });
      return new Response(JSON.stringify({ data: { blogs: [] } }));
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ManageBlogs />);
    fireEvent.click(await screen.findByRole("button", { name: "New Article" }));
    fireEvent.change(screen.getByPlaceholderText(/Article title/), { target: { value: "New article" } });
    fireEvent.change(screen.getByPlaceholderText(/Write your article/), { target: { value: "## Heading\nContent" } });
    fireEvent.change(screen.getByLabelText("Writer role / title"), { target: { value: "Horticulturist" } });
    fireEvent.change(screen.getByLabelText("Writer biography"), { target: { value: "Growing plants in Nepal." } });
    fireEvent.change(screen.getByLabelText(/Grower's tips/), { target: { value: "Check soil\nUse drainage" } });
    fireEvent.change(screen.getByLabelText("Upload writer photo"), { target: { files: [new File(["image"], "writer.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: /Publish/ }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([, options]) => typeof options?.body === "string")).toBe(true));
    const payload = JSON.parse(fetchMock.mock.calls.find(([, options]) => typeof options?.body === "string")![1]!.body as string);
    expect(payload).toMatchObject({ author_image: "blogs/writer.webp", author_role: "Horticulturist", author_bio: "Growing plants in Nepal.", tips: ["Check soil", "Use drainage"] });
  });

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
    fireEvent.click(await screen.findByRole("button", { name: "New Article" }));
    fireEvent.change(screen.getByPlaceholderText(/Article title/), { target: { value: "New article" } });
    fireEvent.change(screen.getByPlaceholderText(/Write your article/), { target: { value: "Article content" } });
    fireEvent.change(container.querySelectorAll('input[type="file"]')[1], {
      target: { files: [new File(["image"], "cover.png", { type: "image/png" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Publish/ }));
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
