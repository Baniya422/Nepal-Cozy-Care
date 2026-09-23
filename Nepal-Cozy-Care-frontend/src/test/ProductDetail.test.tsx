import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ProductDetail } from "../pages/ProductDetail";
vi.mock("../components/layout/Layout", () => ({ default: ({children}: {children: ReactNode}) => <>{children}</> }));
vi.mock("../components/common/SEO", () => ({ default: () => null }));
vi.mock("../hooks/useWishlist", () => ({ useWishlist: () => ({wishlistIds: [], wishlistBusyId: null, toggleWishlist: vi.fn()}) }));
const plant = { id: 1, name: "Monstera", price: "1450", stock: 2, size: "Medium", light: "Indirect light", water: "When soil dries", avg_rating: "4.2", review_count: 8 };
const response = (data: unknown, ok = true, status = 200) => ({ ok, status, json: async () => data });
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function show() { render(<MemoryRouter initialEntries={["/plants/1"]}><Routes><Route path="/plants/:id" element={<ProductDetail/>}/></Routes></MemoryRouter>); }
it("shows actual rating and size, and limits quantity to available stock", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({data: {plant}})));
  show();
  await screen.findByRole("heading", {name: "Monstera"});
  expect(screen.getByText("4.2")).toBeInTheDocument();
  expect(screen.queryByText("Small Rs 222")).not.toBeInTheDocument();
  expect(screen.getByRole("button", {name:"Decrease quantity"})).toBeDisabled();
  fireEvent.click(screen.getByRole("button", {name:"Increase quantity"}));
  expect(screen.getByRole("button", {name:"Increase quantity"})).toBeDisabled();
  expect(screen.getByLabelText("Quantity")).toHaveTextContent("2");
});
it("disables purchasing when out of stock", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({data: {plant: {...plant, stock: 0}}})));
  show(); await screen.findByRole("heading", {name: "Monstera"});
  expect(screen.getByRole("button", {name:"Buy now"})).toBeDisabled();
  for (const button of screen.getAllByRole("button", {name:"Out of stock"})) expect(button).toBeDisabled();
});
it("shows a recoverable load error and retries", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(response({data: {plant}})));
  show(); fireEvent.click(await screen.findByRole("button", {name:"Try again"}));
  expect(await screen.findByRole("heading", {name:"Monstera"})).toBeInTheDocument();
});
it("submits selected quantity and shows inline cart confirmation", async () => {
  localStorage.setItem("token", "test");
  const fetchMock = vi.fn().mockImplementation(async (url: string) => (String(url).includes("/api/plants/") ? response({data:{plant}}) : response({message:"Added"})));
  vi.stubGlobal("fetch", fetchMock); show();
  await screen.findByRole("heading", {name:"Monstera"});
  fireEvent.click(screen.getByRole("button", {name:"Increase quantity"}));
  fireEvent.click(screen.getAllByRole("button", {name:"Add to cart"})[0]);
  await waitFor(() => expect(screen.getByText(/Added 2 Monstera/i)).toBeInTheDocument());
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({plant_id:1, quantity:2});
});
