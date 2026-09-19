import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import SellerLayout from "../components/seller/SellerLayout";

function PublicPage({ label, to }: { label: string; to: string }) {
  const navigate = useNavigate();
  return (
    <Layout>
      <p>{label}</p>
      <button onClick={() => navigate(to)}>Next public page</button>
    </Layout>
  );
}

function SellerPage({ label, to }: { label: string; to: string }) {
  const navigate = useNavigate();
  return (
    <SellerLayout>
      <p>{label}</p>
      <button onClick={() => navigate(to)}>Next seller page</button>
    </SellerLayout>
  );
}

describe("persistent route layouts", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Test Seller", role: "seller" })
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("keeps the public navbar mounted between public routes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { cart: [] } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/first"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="first" element={<PublicPage label="First page" to="/second" />} />
            <Route path="second" element={<PublicPage label="Second page" to="/first" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Next public page" }));
    expect(await screen.findByText("Second page")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the seller shell and shop request mounted between seller routes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          shop: {
            id: 1,
            name: "Test Nursery",
            slug: "test-nursery",
            status: "approved",
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/seller/first"]}>
        <Routes>
          <Route path="seller" element={<SellerLayout />}>
            <Route path="first" element={<SellerPage label="Seller first" to="/seller/second" />} />
            <Route path="second" element={<SellerPage label="Seller second" to="/seller/first" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Next seller page" }));
    expect(await screen.findByText("Seller second")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
