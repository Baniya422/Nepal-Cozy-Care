import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import Pots from "../pages/Pots";

vi.mock("../components/layout/Layout", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("../components/common/SEO", () => ({ default: () => null }));
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const show = () => render(<MemoryRouter><Pots /></MemoryRouter>);

it("renders catalog cards and first-row images while the API is still pending", () => {
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  show();
  expect(screen.getByText("Minimalist Ceramic Planter")).toBeInTheDocument();
  expect(screen.getByAltText("Minimalist Ceramic Planter")).toHaveAttribute("loading", "eager");
  expect(document.querySelector(".skeleton-card")).toBeNull();
});

it("replaces the initial catalog with live accessories when the request finishes", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { plants: [
    { id: 987, name: "Live Ceramic Pot", category: "Pots & Planters", price: "950", stock: 3 },
  ] } }) }));
  show();
  expect(await screen.findByText("Live Ceramic Pot")).toBeInTheDocument();
  expect(screen.queryByText("Minimalist Ceramic Planter")).toBeNull();
});

it("requests the signed-in wishlist once instead of once per product card", () => {
  localStorage.setItem("token", "test");
  const fetchMock = vi.fn((_url: string) => new Promise(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  show();
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/api/wishlist"))).toHaveLength(1);
});

