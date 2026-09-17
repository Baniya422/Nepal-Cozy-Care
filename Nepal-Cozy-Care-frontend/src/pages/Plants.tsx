import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import ProductGrid from "../components/plants/ProductGrid";
import UgaooFilterDrawer, {
  defaultFilterValues,
  type UgaooFilterValues,
} from "../components/plants/UgaooFilterDrawer";
import UgaooSortDropdown, {
  type UgaooSortOption,
} from "../components/plants/UgaooSortDropdown";
import { DEFAULT_PLANT_CATALOG } from "../features/plant-finder/data";
import type { Plant } from "../types/plant";
import "../styles/plants.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function Plants() {
  const [plants, setPlants] = useState<Plant[]>(DEFAULT_PLANT_CATALOG as Plant[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistBusyId, setWishlistBusyId] = useState<number | null>(null);

  // Ugaoo Filter & Sort state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<UgaooFilterValues>(defaultFilterValues);
  const [sortBy, setSortBy] = useState<UgaooSortOption>("featured");

  useEffect(() => {
    fetchPlants();
    fetchWishlist();
  }, []);

  const fetchPlants = async () => {
    setError(null);
    try {
      const response = await fetch(`${API}/api/plants?per_page=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      let plantsData = data.data?.plants || data.data?.data || [];
      plantsData = plantsData.map((plant: any) => ({
        ...plant,
        price: parseFloat(plant.price) || 0,
        avg_rating: parseFloat(plant.avg_rating) || 0,
      }));
      plantsData = plantsData.filter((plant: any) => {
        const category = (plant.category || "").toLowerCase().trim();
        return (
          !category.includes("pot") &&
          !category.includes("tool") &&
          !category.includes("soil") &&
          !category.includes("fertilizer") &&
          !category.includes("accessory")
        );
      });
      if (plantsData.length > 0) {
        setPlants(plantsData);
      }
    } catch (err) {
      console.warn("Using fallback catalog for plants list:", err);
      // Keep DEFAULT_PLANT_CATALOG as fallback
      setPlants(DEFAULT_PLANT_CATALOG as Plant[]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlistIds([]);
      return;
    }
    try {
      const response = await fetch(`${API}/api/wishlist`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setWishlistIds([]);
        return;
      }
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const wishlistItems = data.data?.wishlist ?? [];
      const ids = wishlistItems
        .map((item: any) => item.plant?.id ?? item.plant_id)
        .filter((id: unknown): id is number => typeof id === "number");
      setWishlistIds(ids);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleToggleWishlist = async (plantId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to your wishlist.");
      return;
    }
    const isWishlisted = wishlistIds.includes(plantId);
    setWishlistBusyId(plantId);
    try {
      const response = await fetch(
        `${API}/api/wishlist${isWishlisted ? `/${plantId}` : ""}`,
        {
          method: isWishlisted ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: isWishlisted ? undefined : JSON.stringify({ plant_id: plantId }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setWishlistIds([]);
        alert("Your session expired. Please login again.");
        return;
      }
      if (!response.ok) {
        alert(data.message || "Could not update wishlist.");
        return;
      }
      setWishlistIds((current) =>
        isWishlisted
          ? current.filter((id) => id !== plantId)
          : [...current, plantId]
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Something went wrong while updating wishlist.");
    } finally {
      setWishlistBusyId(null);
    }
  };

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.plantTypes.length > 0) count += filters.plantTypes.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.priceMin !== "" || filters.priceMax !== "") count += 1;
    if (filters.lights.length > 0) count += filters.lights.length;
    if (filters.locations.length > 0) count += filters.locations.length;
    if (filters.environment.length > 0) count += filters.environment.length;
    if (filters.maintenance.length > 0) count += filters.maintenance.length;
    if (filters.waterSchedule.length > 0) count += filters.waterSchedule.length;
    if (filters.inStockOnly) count += 1;
    return count;
  }, [filters]);

  // Apply filters and sort
  const filteredPlants = useMemo(() => {
    let result = [...plants];

    // Plant Types
    if (filters.plantTypes.length > 0) {
      result = result.filter((p) =>
        filters.plantTypes.some((type) =>
          (p.category || "").toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Sizes
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        filters.sizes.some((s) => (p.size || "").toLowerCase() === s.toLowerCase())
      );
    }

    // Price Range
    if (filters.priceMin !== "") {
      result = result.filter((p) => p.price >= Number(filters.priceMin));
    }
    if (filters.priceMax !== "") {
      result = result.filter((p) => p.price <= Number(filters.priceMax));
    }

    // Light
    if (filters.lights.length > 0) {
      result = result.filter((p) =>
        filters.lights.some((l) =>
          (p.light || "").toLowerCase().includes(l.toLowerCase())
        )
      );
    }

    // Ideal Location / Rooms
    if (filters.locations.length > 0) {
      result = result.filter((p) => {
        const rooms = Array.isArray(p.rooms)
          ? p.rooms
          : typeof p.rooms === "string"
          ? [p.rooms]
          : [];
        return filters.locations.some((loc) =>
          rooms.some((r: string) => r.toLowerCase().includes(loc.toLowerCase()))
        );
      });
    }

    // Environment (Indoor / Outdoor)
    if (filters.environment.length > 0) {
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const rooms = Array.isArray(p.rooms) ? p.rooms : [];
        if (filters.environment.includes("indoor") && !cat.includes("outdoor")) {
          return true;
        }
        if (
          filters.environment.includes("outdoor") &&
          (cat.includes("outdoor") || rooms.includes("balcony"))
        ) {
          return true;
        }
        return false;
      });
    }

    // Maintenance / Difficulty
    if (filters.maintenance.length > 0) {
      result = result.filter((p) =>
        filters.maintenance.some((m) =>
          (p.difficulty || "").toLowerCase().includes(m.toLowerCase())
        )
      );
    }

    // Water Schedule
    if (filters.waterSchedule.length > 0) {
      result = result.filter((p) =>
        filters.waterSchedule.some((w) =>
          (p.water || "").toLowerCase().includes(w.toLowerCase())
        )
      );
    }

    // In Stock Only
    if (filters.inStockOnly) {
      result = result.filter((p) => p.is_active !== false);
    }

    // Apply Sorting (Screenshot 4)
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "alpha_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alpha_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "best_selling":
        result.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      case "date_asc":
        result.sort((a, b) => a.id - b.id);
        break;
      case "date_desc":
        result.sort((a, b) => b.id - a.id);
        break;
      case "relevant":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "featured":
      default:
        result.sort((a, b) => {
          if (a.is_best_seller && !b.is_best_seller) return -1;
          if (!a.is_best_seller && b.is_best_seller) return 1;
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        });
        break;
    }

    return result;
  }, [plants, filters, sortBy]);

  // Remove individual filter chip
  const removeFilterChip = (type: keyof UgaooFilterValues, val?: string) => {
    setFilters((prev) => {
      if (Array.isArray(prev[type])) {
        return {
          ...prev,
          [type]: (prev[type] as string[]).filter((x) => x !== val),
        };
      }
      if (type === "priceMin" || type === "priceMax") {
        return { ...prev, priceMin: "", priceMax: "" };
      }
      if (type === "inStockOnly") {
        return { ...prev, inStockOnly: false };
      }
      return prev;
    });
  };

  return (
    <Layout>
      <div className="plants-page ugaoo-plants-page">
        {/* ================= HERO HEADER ================= */}
        <div className="ugaoo-plants-hero">
          <div className="ugaoo-plants-hero-inner">
            <h1 className="ugaoo-page-heading">Plants</h1>
            <p className="ugaoo-page-subtext">
              Transform your living spaces with hand-nurtured houseplants and outdoor flora
            </p>
          </div>
        </div>

        {/* ================= UGAOO ACTION BAR (Screenshots 1 & 4) ================= */}
        <div className="ugaoo-action-bar-container">
          <div className="ugaoo-action-bar">
            {/* FILTER Trigger (Screenshot 1) */}
            <button
              type="button"
              className="ugaoo-filter-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
              aria-label="Open plant filters"
            >
              <SlidersHorizontal size={17} className="ugaoo-filter-icon" />
              <span className="ugaoo-filter-text">FILTER</span>
              {activeFilterCount > 0 && (
                <span className="ugaoo-filter-badge">{activeFilterCount}</span>
              )}
            </button>

            {/* Product Count & Sort by Dropdown (Screenshot 4) */}
            <div className="ugaoo-action-right">
              <span className="ugaoo-count-label">
                {filteredPlants.length} products
              </span>
              <UgaooSortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Active Filter Chips (if any active) */}
          {activeFilterCount > 0 && (
            <div className="ugaoo-active-chips-bar">
              {filters.plantTypes.map((t) => (
                <span key={t} className="ugaoo-active-chip">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("plantTypes", t)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {filters.sizes.map((s) => (
                <span key={s} className="ugaoo-active-chip">
                  Size: {s}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("sizes", s)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {(filters.priceMin !== "" || filters.priceMax !== "") && (
                <span className="ugaoo-active-chip">
                  Price: Rs. {filters.priceMin || 0} - {filters.priceMax || "Max"}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("priceMin")}
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {filters.lights.map((l) => (
                <span key={l} className="ugaoo-active-chip">
                  {l.replace("-", " ")}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("lights", l)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {filters.locations.map((loc) => (
                <span key={loc} className="ugaoo-active-chip">
                  {loc.replace("-", " ")}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("locations", loc)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {filters.maintenance.map((m) => (
                <span key={m} className="ugaoo-active-chip">
                  Care: {m}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("maintenance", m)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {filters.waterSchedule.map((w) => (
                <span key={w} className="ugaoo-active-chip">
                  Water: {w}
                  <button
                    type="button"
                    onClick={() => removeFilterChip("waterSchedule", w)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {filters.inStockOnly && (
                <span className="ugaoo-active-chip">
                  In Stock Only
                  <button
                    type="button"
                    onClick={() => removeFilterChip("inStockOnly")}
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              <button
                type="button"
                className="ugaoo-clear-all-chip-btn"
                onClick={() => setFilters(defaultFilterValues)}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* ================= MAIN PRODUCTS GRID ================= */}
        <main className="ugaoo-plants-main">
          <ProductGrid
            plants={filteredPlants}
            loading={loading}
            error={error}
            fetchPlants={fetchPlants}
            wishlistIds={wishlistIds}
            wishlistBusyId={wishlistBusyId}
            onToggleWishlist={handleToggleWishlist}
          />
        </main>

        {/* ================= UGAOO SLIDE-OUT FILTER DRAWER ================= */}
        <UgaooFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onApply={(newFilters) => setFilters(newFilters)}
          totalProductsCount={filteredPlants.length}
          availablePlants={plants}
        />
      </div>
    </Layout>
  );
}
