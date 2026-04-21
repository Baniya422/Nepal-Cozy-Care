import { describe, expect, it } from "vitest";
import type { CatalogPlant } from "./types";
import {
  extractCatalogPlants,
  filterCatalogPlants,
  matchesPriceRange,
  normalizeCatalogPlants,
  sortCatalogPlants,
  toggleNumberValue,
  toggleStringValue,
} from "./utils";

const catalogFixture: CatalogPlant[] = [
  {
    id: 1,
    name: "Aloe Vera",
    price: "450",
    avg_rating: 4.7,
    total_sold: 120,
    category: "plants",
  },
  {
    id: 2,
    name: "Ceramic Pot",
    price: 900,
    avg_rating: 4.3,
    total_sold: 210,
    category: "pots",
  },
  {
    id: 3,
    name: "Watering Can",
    price: "2200",
    avg_rating: 4.9,
    total_sold: 95,
    category: "tools",
  },
  {
    id: 4,
    name: "Snake Plant",
    price: 1300,
    avg_rating: 4.9,
    total_sold: 330,
    category: "plants",
  },
];

describe("catalog/utils", () => {
  it("normalizes price values into numbers", () => {
    const normalized = normalizeCatalogPlants([
      { id: 1, name: "A", price: "599.5" },
      { id: 2, name: "B", price: 1200 },
      { id: 3, name: "C", price: null as unknown as string },
    ]);

    expect(normalized.map((item) => item.price)).toEqual([599.5, 1200, 0]);
  });

  it("extracts plants from multiple API payload shapes", () => {
    const fromDataData = extractCatalogPlants({ data: { data: [catalogFixture[0]] } });
    const fromDataPlants = extractCatalogPlants({ data: { plants: [catalogFixture[1]] } });
    const fromDataRoot = extractCatalogPlants({ data: [catalogFixture[2]] });
    const fromInvalid = extractCatalogPlants({ data: { plants: "invalid" } });

    expect(fromDataData).toHaveLength(1);
    expect(fromDataPlants[0].name).toBe("Ceramic Pot");
    expect(fromDataRoot[0].name).toBe("Watering Can");
    expect(fromInvalid).toEqual([]);
  });

  it("toggles string and number values in filter arrays", () => {
    expect(toggleStringValue(["under-500"], "500-1000")).toEqual(["under-500", "500-1000"]);
    expect(toggleStringValue(["under-500", "500-1000"], "under-500")).toEqual(["500-1000"]);

    expect(toggleNumberValue([4], 5)).toEqual([4, 5]);
    expect(toggleNumberValue([4, 5], 4)).toEqual([5]);
  });

  it("matches price boundaries correctly", () => {
    expect(matchesPriceRange(499, "under-500")).toBe(true);
    expect(matchesPriceRange(500, "under-500")).toBe(false);

    expect(matchesPriceRange(500, "500-1000")).toBe(true);
    expect(matchesPriceRange(1000, "500-1000")).toBe(true);
    expect(matchesPriceRange(1001, "500-1000")).toBe(false);

    expect(matchesPriceRange(1001, "1000-2000")).toBe(true);
    expect(matchesPriceRange(2000, "1000-2000")).toBe(true);
    expect(matchesPriceRange(2001, "1000-2000")).toBe(false);

    expect(matchesPriceRange(2001, "over-2000")).toBe(true);
  });

  it("filters plants by category, search, price, and rating", () => {
    const filtered = filterCatalogPlants({
      plants: catalogFixture,
      category: "plants",
      searchTerm: "aloe",
      priceFilters: ["under-500"],
      ratingFilters: [4],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Aloe Vera");
  });

  it("sorts by sales, rating/popularity, price, and name", () => {
    const bySales = sortCatalogPlants(catalogFixture, "sales");
    expect(bySales[0].name).toBe("Snake Plant");

    const byPopular = sortCatalogPlants(catalogFixture, "popular");
    expect(byPopular[0].name).toBe("Snake Plant");

    const byPriceAsc = sortCatalogPlants(catalogFixture, "price-asc");
    expect(byPriceAsc.map((item) => item.name)).toEqual([
      "Aloe Vera",
      "Ceramic Pot",
      "Snake Plant",
      "Watering Can",
    ]);

    const byPriceDesc = sortCatalogPlants(catalogFixture, "price-desc");
    expect(byPriceDesc[0].name).toBe("Watering Can");

    const byName = sortCatalogPlants(catalogFixture, "name-asc");
    expect(byName.map((item) => item.name)).toEqual([
      "Aloe Vera",
      "Ceramic Pot",
      "Snake Plant",
      "Watering Can",
    ]);
  });
});
