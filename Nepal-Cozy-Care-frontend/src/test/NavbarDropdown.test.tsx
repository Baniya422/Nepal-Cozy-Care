import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Navbar from "../components/layout/Navbar";

vi.mock("../context/FeatureFlagsContext", () => ({
  useFeatureFlags: () => ({ vendor_marketplace_enabled: false }),
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  localStorage.clear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
function setup() {
  render(<MemoryRouter><Navbar /></MemoryRouter>);
  const link = screen.getByRole("link", { name: /^Plants$/i });
  const menu = link.closest(".site-nav__item--dropdown")!;
  return { link, menu };
}
it("stays open when entering its dropdown and closes immediately on leaving", () => {
  const { link, menu } = setup();
  fireEvent.mouseEnter(menu);
  act(() => vi.advanceTimersByTime(5000));
  expect(menu).toHaveClass("is-desktop-open");
  const child = screen.getByRole("link", { name: /^Indoor Plants$/i });
  fireEvent.mouseOut(link, { relatedTarget: child });
  fireEvent.mouseOver(child, { relatedTarget: link });
  expect(menu).toHaveClass("is-desktop-open");
  fireEvent.mouseLeave(menu);
  expect(menu).not.toHaveClass("is-desktop-open");
});
it("shows only the newly hovered menu", () => {
  const { menu } = setup();
  fireEvent.mouseEnter(menu);
  const accessories = screen.getByRole("link", { name: /^Accessories$/i })
    .closest(".site-nav__item--dropdown")!;
  fireEvent.mouseLeave(menu);
  fireEvent.mouseEnter(accessories);
  expect(menu).not.toHaveClass("is-desktop-open");
  expect(accessories).toHaveClass("is-desktop-open");
  fireEvent.mouseLeave(accessories);
  expect(accessories).not.toHaveClass("is-desktop-open");
});
it("closes immediately when the main link or a dropdown link is clicked", () => {
  const { link, menu } = setup();
  fireEvent.mouseEnter(menu);
  fireEvent.click(link);
  expect(menu).not.toHaveClass("is-desktop-open");
  fireEvent.mouseEnter(menu);
  fireEvent.click(screen.getByRole("link", { name: /^Indoor Plants$/i }));
  expect(menu).not.toHaveClass("is-desktop-open");
});
it("supports keyboard focus and Escape", () => {
  const { link, menu } = setup();
  fireEvent.focus(link);
  expect(menu).toHaveClass("is-desktop-open");
  fireEvent.keyDown(link, { key: "Escape" });
  expect(menu).not.toHaveClass("is-desktop-open");
});


