import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ManagePlants from "../pages/admin/ManagePlants";

vi.mock("../components/admin/AdminLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
afterEach(() => vi.unstubAllGlobals());

it("submits card pricing and care details used by Plant Finder", async () => {
  localStorage.setItem("token", "test-token");
  vi.stubGlobal("alert", vi.fn());
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => new Response(JSON.stringify(
    options?.method === "POST" ? { data: { plant: { id: 101 } } } : { data: { plants: [] } }
  )));
  vi.stubGlobal("fetch", fetchMock);
  render(<ManagePlants />);
  fireEvent.click(await screen.findByRole("button", { name: /Add.*Plant/ }));
  fireEvent.change(screen.getByLabelText("Plant Name *"), { target: { value: "Office plant" } });
  fireEvent.change(screen.getByLabelText("Selling Price (NPR) *"), { target: { value: "850" } });
  fireEvent.change(screen.getByLabelText("Stock Quantity *"), { target: { value: "5" } });
  fireEvent.change(screen.getByLabelText("Discount (%)"), { target: { value: "15" } });
  fireEvent.change(screen.getByLabelText("Soil / Potting Mix"), { target: { value: "Perlite mix" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /Home Office/ }));
  fireEvent.click(screen.getByRole("button", { name: "Add Plant" }));
  await waitFor(() => expect(fetchMock.mock.calls.some(([, options]) => options?.method === "POST")).toBe(true));
  const body = fetchMock.mock.calls.find(([, options]) => options?.method === "POST")![1]!.body as FormData;
  expect(body.get("discount_percent")).toBe("15");
  expect(body.get("soil")).toBe("Perlite mix");
  expect(body.get("difficulty")).toBe("Beginner Friendly");
  expect(body.getAll("rooms[]")).toContain("Home Office");
});
