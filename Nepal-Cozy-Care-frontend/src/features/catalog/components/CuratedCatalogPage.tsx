import { useCallback, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "../../../components/plants/ProductGrid";
import UgaooFilterDrawer, {
  defaultFilterValues,
  type UgaooFilterValues,
} from "../../../components/plants/UgaooFilterDrawer";
import UgaooSortDropdown, {
  type UgaooSortOption,
} from "../../../components/plants/UgaooSortDropdown";
import { useWishlist } from "../../../hooks/useWishlist";
import type { Plant } from "../../../types/plant";
import "../../../styles/plants.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type CuratedCatalogPageProps = {
  endpoint: string;
  title: string;
  subtitle: string;
  initialSort: UgaooSortOption;
  emptyMessage: string;
  showSalesRanking?: boolean;
};

const labelForFilter = (value: string) =>
  value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function CuratedCatalogPage({
  endpoint,
  title,
  subtitle,
  initialSort,
  emptyMessage,
  showSalesRanking = false,
}: CuratedCatalogPageProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<UgaooFilterValues>(defaultFilterValues);
  const [sortBy, setSortBy] = useState<UgaooSortOption>(initialSort);
  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({
    apiBaseUrl: API,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API}${endpoint}?per_page=100`);
      if (!response.ok) {
        throw new Error(`Could not load products (${response.status}).`);
      }

      const payload = await response.json();
      const rawPlants =
        payload?.data?.data ?? payload?.data?.plants ?? payload?.data ?? [];

      if (!Array.isArray(rawPlants)) {
        throw new Error("The product response was not in the expected format.");
      }

      setPlants(
        rawPlants.map((plant: Plant) => ({
          ...plant,
          price: Number(plant.price) || 0,
          avg_rating: Number(plant.avg_rating) || 0,
          review_count: Number(plant.review_count) || 0,
          total_sold: Number(plant.total_sold) || 0,
          views: Number(plant.views) || 0,
        }))
      );
    } catch (fetchError) {
      setPlants([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load products."
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.plantTypes.length;
    count += filters.sizes.length;
    count += filters.lights.length;
    count += filters.locations.length;
    count += filters.environment.length;
    count += filters.maintenance.length;
    count += filters.waterSchedule.length;
    if (filters.priceMin !== "" || filters.priceMax !== "") count += 1;
    if (filters.inStockOnly) count += 1;
    return count;
  }, [filters]);

  const filteredPlants = useMemo(() => {
    let result = [...plants];

    if (filters.plantTypes.length > 0) {
      result = result.filter((plant) =>
        filters.plantTypes.some((type) =>
          (plant.category || "").toLowerCase().includes(type.toLowerCase())
        )
      );
    }
    if (filters.sizes.length > 0) {
      result = result.filter((plant) =>
        filters.sizes.some(
          (size) => (plant.size || "").toLowerCase() === size.toLowerCase()
        )
      );
    }
    if (filters.priceMin !== "") {
      result = result.filter((plant) => plant.price >= Number(filters.priceMin));
    }
    if (filters.priceMax !== "") {
      result = result.filter((plant) => plant.price <= Number(filters.priceMax));
    }
    if (filters.lights.length > 0) {
      result = result.filter((plant) =>
        filters.lights.some((light) =>
          (plant.light || "").toLowerCase().includes(light.toLowerCase())
        )
      );
    }
    if (filters.locations.length > 0) {
      result = result.filter((plant) => {
        const rooms = Array.isArray(plant.rooms)
          ? plant.rooms
          : typeof plant.rooms === "string"
            ? [plant.rooms]
            : [];
        return filters.locations.some((location) =>
          rooms.some((room) =>
            room.toLowerCase().includes(location.toLowerCase())
          )
        );
      });
    }
    if (filters.environment.length > 0) {
      result = result.filter((plant) => {
        const category = (plant.category || "").toLowerCase();
        const rooms = Array.isArray(plant.rooms) ? plant.rooms : [];
        const matchesIndoor =
          filters.environment.includes("indoor") &&
          !category.includes("outdoor");
        const matchesOutdoor =
          filters.environment.includes("outdoor") &&
          (category.includes("outdoor") || rooms.includes("balcony"));
        return matchesIndoor || matchesOutdoor;
      });
    }
    if (filters.maintenance.length > 0) {
      result = result.filter((plant) =>
        filters.maintenance.some((level) =>
          (plant.difficulty || "").toLowerCase().includes(level.toLowerCase())
        )
      );
    }
    if (filters.waterSchedule.length > 0) {
      result = result.filter((plant) =>
        filters.waterSchedule.some((schedule) =>
          (plant.water || "").toLowerCase().includes(schedule.toLowerCase())
        )
      );
    }
    if (filters.inStockOnly) {
      result = result.filter((plant) => Number(plant.stock ?? 0) > 0);
    }

    switch (sortBy) {
      case "relevant":
        result.sort((first, second) => (second.views || 0) - (first.views || 0));
        break;
      case "best_selling":
        result.sort(
          (first, second) =>
            (second.total_sold || 0) - (first.total_sold || 0)
        );
        break;
      case "alpha_asc":
        result.sort((first, second) => first.name.localeCompare(second.name));
        break;
      case "alpha_desc":
        result.sort((first, second) => second.name.localeCompare(first.name));
        break;
      case "price_asc":
        result.sort((first, second) => first.price - second.price);
        break;
      case "price_desc":
        result.sort((first, second) => second.price - first.price);
        break;
      case "date_asc":
        result.sort(
          (first, second) =>
            new Date(first.created_at || 0).getTime() -
            new Date(second.created_at || 0).getTime()
        );
        break;
      case "date_desc":
        result.sort(
          (first, second) =>
            new Date(second.created_at || 0).getTime() -
            new Date(first.created_at || 0).getTime()
        );
        break;
      case "featured":
      default:
        break;
    }

    return result;
  }, [filters, plants, sortBy]);

  const salesRanks = useMemo(() => {
    const ranked = [...plants].sort(
      (first, second) => (second.total_sold || 0) - (first.total_sold || 0)
    );
    return new Map(ranked.map((plant, index) => [plant.id, index + 1]));
  }, [plants]);

  const removeFilterChip = (key: keyof UgaooFilterValues, value?: string) => {
    setFilters((current) => {
      if (Array.isArray(current[key])) {
        return {
          ...current,
          [key]: (current[key] as string[]).filter((item) => item !== value),
        };
      }
      if (key === "priceMin" || key === "priceMax") {
        return { ...current, priceMin: "", priceMax: "" };
      }
      if (key === "inStockOnly") {
        return { ...current, inStockOnly: false };
      }
      return current;
    });
  };

  const arrayFilterChips: Array<{
    key: keyof UgaooFilterValues;
    prefix?: string;
    values: string[];
  }> = [
    { key: "plantTypes", values: filters.plantTypes },
    { key: "sizes", prefix: "Size: ", values: filters.sizes },
    { key: "lights", prefix: "Light: ", values: filters.lights },
    { key: "locations", prefix: "Room: ", values: filters.locations },
    { key: "environment", values: filters.environment },
    { key: "maintenance", prefix: "Care: ", values: filters.maintenance },
    { key: "waterSchedule", prefix: "Water: ", values: filters.waterSchedule },
  ];

  return (
    <div className="plants-page ugaoo-plants-page">
      <header className="ugaoo-plants-hero">
        <div className="ugaoo-plants-hero-inner">
          <h1 className="ugaoo-page-heading">{title}</h1>
          <p className="ugaoo-page-subtext">{subtitle}</p>
        </div>
      </header>

      <div className="ugaoo-action-bar-container">
        <div className="ugaoo-action-bar">
          <button
            type="button"
            className="ugaoo-filter-btn"
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-label={`Open ${title.toLowerCase()} filters`}
          >
            <SlidersHorizontal size={17} className="ugaoo-filter-icon" />
            <span className="ugaoo-filter-text">Filter</span>
            {activeFilterCount > 0 ? (
              <span className="ugaoo-filter-badge">{activeFilterCount}</span>
            ) : null}
          </button>

          <div className="ugaoo-action-right">
            <span className="ugaoo-count-label">
              {filteredPlants.length} product{filteredPlants.length === 1 ? "" : "s"}
            </span>
            <UgaooSortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {activeFilterCount > 0 ? (
          <div className="ugaoo-active-chips-bar">
            {arrayFilterChips.flatMap(({ key, prefix = "", values }) =>
              values.map((value) => (
                <span key={`${String(key)}-${value}`} className="ugaoo-active-chip">
                  {prefix}{labelForFilter(value)}
                  <button
                    type="button"
                    onClick={() => removeFilterChip(key, value)}
                    aria-label={`Remove ${labelForFilter(value)} filter`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))
            )}
            {filters.priceMin !== "" || filters.priceMax !== "" ? (
              <span className="ugaoo-active-chip">
                Price: Rs. {filters.priceMin || 0} - {filters.priceMax || "Max"}
                <button
                  type="button"
                  onClick={() => removeFilterChip("priceMin")}
                  aria-label="Remove price filter"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}
            {filters.inStockOnly ? (
              <span className="ugaoo-active-chip">
                In Stock Only
                <button
                  type="button"
                  onClick={() => removeFilterChip("inStockOnly")}
                  aria-label="Remove availability filter"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}
            <button
              type="button"
              className="ugaoo-clear-all-chip-btn"
              onClick={() => setFilters(defaultFilterValues)}
            >
              Clear All
            </button>
          </div>
        ) : null}
      </div>

      <main className="ugaoo-plants-main">
        <ProductGrid
          plants={filteredPlants}
          loading={loading}
          error={error}
          fetchPlants={fetchProducts}
          wishlistIds={wishlistIds}
          wishlistBusyId={wishlistBusyId}
          onToggleWishlist={(plantId) => void toggleWishlist(plantId)}
          emptyMessage={emptyMessage}
          badgeLabel={
            showSalesRanking
              ? (plant) => `#${salesRanks.get(plant.id) ?? "-"} Best seller`
              : undefined
          }
          showSoldCount={showSalesRanking}
        />
      </main>

      <UgaooFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApply={setFilters}
        totalProductsCount={filteredPlants.length}
        availablePlants={plants}
      />
    </div>
  );
}
