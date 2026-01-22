import { Star } from "lucide-react";
import { priceFilterOptions, ratingFilterOptions } from "../data";
import type { PriceFilterKey } from "../types";

type CatalogSidebarProps = {
  priceFilters: PriceFilterKey[];
  ratingFilters: number[];
  onTogglePrice: (value: PriceFilterKey) => void;
  onToggleRating: (value: number) => void;
};

export default function CatalogSidebar({
  priceFilters,
  ratingFilters,
  onTogglePrice,
  onToggleRating,
}: CatalogSidebarProps) {
  return (
    <aside className="popular-sidebar">
      <div className="popular-sidebar-section">
        <h2 className="popular-sidebar-title">Price Range</h2>
        <div className="popular-sidebar-options">
          {priceFilterOptions.map((option) => (
            <label key={option.value} className="popular-option">
              <input
                type="checkbox"
                checked={priceFilters.includes(option.value)}
                onChange={() => onTogglePrice(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="popular-sidebar-section">
        <h2 className="popular-sidebar-title">Rating</h2>
        <div className="popular-sidebar-options">
          {ratingFilterOptions.map((minimum) => (
            <label key={minimum} className="popular-option">
              <input
                type="checkbox"
                checked={ratingFilters.includes(minimum)}
                onChange={() => onToggleRating(minimum)}
              />
              <span>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    className={
                      index < minimum
                        ? "popular-star-filled"
                        : "popular-star-empty"
                    }
                  />
                ))}{" "}
                &amp; up
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
