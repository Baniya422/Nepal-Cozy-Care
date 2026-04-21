import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageWithFallback } from "../components/ImageWithFallback";

describe("ImageWithFallback", () => {
  it("renders with the provided src", () => {
    const src = "test-image.jpg";
    const alt = "Test Alt Text";
    render(<ImageWithFallback src={src} alt={alt} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", src);
    expect(img).toHaveAttribute("alt", alt);
  });

  it("switches to fallback src on error", () => {
    const src = "invalid-image.jpg";
    const fallbackSrc = "fallback.jpg";
    render(<ImageWithFallback src={src} alt="Test Alt" fallbackSrc={fallbackSrc} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", src);
    
    fireEvent.error(img);
    
    expect(img).toHaveAttribute("src", fallbackSrc);
  });

  it("renders fallback immediately if src is empty", () => {
    const fallbackSrc = "fallback.jpg";
    render(<ImageWithFallback src="" alt="Test Alt" fallbackSrc={fallbackSrc} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", fallbackSrc);
  });
});
