import { useState, useEffect } from "react";
import { X, ArrowLeft, ChevronRight, Check } from "lucide-react";
import type { Plant } from "../../types/plant";

export type UgaooFilterValues = {
  plantTypes: string[];
  sizes: string[];
  priceMin: number | "";
  priceMax: number | "";
  lights: string[];
  locations: string[];
  environment: string[];
  maintenance: string[];
  waterSchedule: string[];
  inStockOnly: boolean;
};

export const defaultFilterValues: UgaooFilterValues = {
  plantTypes: [],
  sizes: [],
  priceMin: "",
  priceMax: "",
  lights: [],
  locations: [],
  environment: [],
  maintenance: [],
  waterSchedule: [],
  inStockOnly: false,
};

type UgaooFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: UgaooFilterValues;
  onApply: (filters: UgaooFilterValues) => void;
  totalProductsCount: number;
  availablePlants: Plant[];
};

type FilterCategoryKey =
  | "type"
  | "size"
  | "price"
  | "light"
  | "location"
  | "environment"
  | "maintenance"
  | "water"
  | "availability";

interface CategoryMeta {
  key: FilterCategoryKey;
  label: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: "type", label: "Type of Plants" },
  { key: "size", label: "Plant Size" },
  { key: "price", label: "Price" },
  { key: "light", label: "Light" },
  { key: "location", label: "Ideal plants location" },
  { key: "environment", label: "Indoor/Outdoor" },
  { key: "maintenance", label: "Maintenance" },
  { key: "water", label: "Water Schedule" },
  { key: "availability", label: "Availability" },
];

export default function UgaooFilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  totalProductsCount,
  availablePlants,
}: UgaooFilterDrawerProps) {
  const [draftFilters, setDraftFilters] = useState<UgaooFilterValues>(filters);
  const [activeCategory, setActiveCategory] = useState<FilterCategoryKey | null>(null);

  // Sync draft with incoming filters whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters);
      setActiveCategory(null);
    }
  }, [isOpen, filters]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleArrayItem = (key: keyof UgaooFilterValues, item: string) => {
    setDraftFilters((prev) => {
      const arr = (prev[key] as string[]) || [];
      const exists = arr.includes(item);
      return {
        ...prev,
        [key]: exists ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const getActiveCountForCategory = (catKey: FilterCategoryKey): number => {
    switch (catKey) {
      case "type":
        return draftFilters.plantTypes.length;
      case "size":
        return draftFilters.sizes.length;
      case "price":
        return draftFilters.priceMin !== "" || draftFilters.priceMax !== "" ? 1 : 0;
      case "light":
        return draftFilters.lights.length;
      case "location":
        return draftFilters.locations.length;
      case "environment":
        return draftFilters.environment.length;
      case "maintenance":
        return draftFilters.maintenance.length;
      case "water":
        return draftFilters.waterSchedule.length;
      case "availability":
        return draftFilters.inStockOnly ? 1 : 0;
      default:
        return 0;
    }
  };

  const totalActiveFilters = CATEGORIES.reduce(
    (acc, cat) => acc + getActiveCountForCategory(cat.key),
    0
  );

  const handleClearAll = () => {
    setDraftFilters(defaultFilterValues);
  };

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  // Helper to count available items for options
  const countPlants = (predicate: (p: Plant) => boolean) => {
    return availablePlants.filter(predicate).length;
  };

  // Predefined options
  const plantTypeOptions = [
    { value: "Air Purifying", label: "Air Purifying" },
    { value: "Indoor Plants", label: "Indoor Plants" },
    { value: "Succulents", label: "Succulents" },
    { value: "Flowering", label: "Flowering Plants" },
  ];

  const sizeOptions = [
    { value: "Small", label: "Small" },
    { value: "Medium", label: "Medium" },
    { value: "Large", label: "Large" },
  ];

  const lightOptions = [
    { value: "bright-indirect", label: "Bright Indirect Light" },
    { value: "low-light", label: "Low Light Tolerant" },
    { value: "direct-sun", label: "Direct Sunlight" },
    { value: "medium-indirect", label: "Medium / Filtered Light" },
  ];

  const locationOptions = [
    { value: "bedroom", label: "Bedroom" },
    { value: "living-room", label: "Living Room" },
    { value: "bathroom", label: "Bathroom" },
    { value: "balcony", label: "Balcony / Terrace" },
    { value: "office", label: "Home Office / Desk" },
    { value: "kitchen", label: "Kitchen" },
  ];

  const environmentOptions = [
    { value: "indoor", label: "Indoor" },
    { value: "outdoor", label: "Outdoor" },
  ];

  const maintenanceOptions = [
    { value: "beginner", label: "Easy / Beginner" },
    { value: "intermediate", label: "Moderate Care" },
    { value: "expert", label: "Green Thumb / High" },
  ];

  const waterOptions = [
    { value: "low", label: "Low (Once in 10-14 days)" },
    { value: "moderate", label: "Moderate (Once a week)" },
    { value: "high", label: "High / Moisture Loving" },
  ];

  return (
    <div className="ugaoo-drawer-backdrop" onClick={onClose}>
      <div
        className="ugaoo-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ================= HEADER ================= */}
        <div className="ugaoo-drawer-header">
          {activeCategory ? (
            <div className="ugaoo-sub-header">
              <button
                type="button"
                className="ugaoo-back-btn"
                onClick={() => setActiveCategory(null)}
                aria-label="Back to filters"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="ugaoo-sub-title">
                {CATEGORIES.find((c) => c.key === activeCategory)?.label}
              </h2>
            </div>
          ) : (
            <div className="ugaoo-root-header">
              <h2 className="ugaoo-drawer-title">Filter</h2>
              <span className="ugaoo-products-count">{totalProductsCount} products</span>
            </div>
          )}

          <button
            type="button"
            className="ugaoo-close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="ugaoo-drawer-body">
          {/* --- ROOT CATEGORIES LIST (Screenshot 2) --- */}
          {!activeCategory && (
            <div className="ugaoo-category-list">
              {CATEGORIES.map((cat) => {
                const count = getActiveCountForCategory(cat.key);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className="ugaoo-category-row"
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    <div className="ugaoo-cat-label-wrap">
                      <span className="ugaoo-cat-label">{cat.label}</span>
                      {count > 0 && (
                        <span className="ugaoo-cat-active-pill">{count}</span>
                      )}
                    </div>
                    <ChevronRight size={18} className="ugaoo-cat-arrow" />
                  </button>
                );
              })}
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: PRICE (Screenshot 3) --- */}
          {activeCategory === "price" && (
            <div className="ugaoo-sub-view ugaoo-price-subview">
              <div className="ugaoo-price-inputs">
                <div className="ugaoo-price-field">
                  <label htmlFor="price-from">From</label>
                  <div className="ugaoo-input-prefix-wrap">
                    <span className="ugaoo-currency-symbol">Rs.</span>
                    <input
                      id="price-from"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={draftFilters.priceMin}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          priceMin: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="ugaoo-price-field">
                  <label htmlFor="price-to">To</label>
                  <div className="ugaoo-input-prefix-wrap">
                    <span className="ugaoo-currency-symbol">Rs.</span>
                    <input
                      id="price-to"
                      type="number"
                      min={0}
                      placeholder="9999"
                      value={draftFilters.priceMax}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          priceMax: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="ugaoo-quick-chips">
                <span className="ugaoo-quick-label">Quick Ranges:</span>
                <div className="ugaoo-chip-grid">
                  <button
                    type="button"
                    className="ugaoo-quick-chip"
                    onClick={() =>
                      setDraftFilters((p) => ({ ...p, priceMin: 0, priceMax: 500 }))
                    }
                  >
                    Under Rs. 500
                  </button>
                  <button
                    type="button"
                    className="ugaoo-quick-chip"
                    onClick={() =>
                      setDraftFilters((p) => ({ ...p, priceMin: 500, priceMax: 1000 }))
                    }
                  >
                    Rs. 500 - 1,000
                  </button>
                  <button
                    type="button"
                    className="ugaoo-quick-chip"
                    onClick={() =>
                      setDraftFilters((p) => ({ ...p, priceMin: 1000, priceMax: 2000 }))
                    }
                  >
                    Rs. 1,000 - 2,000
                  </button>
                  <button
                    type="button"
                    className="ugaoo-quick-chip"
                    onClick={() =>
                      setDraftFilters((p) => ({ ...p, priceMin: 2000, priceMax: 9999 }))
                    }
                  >
                    Above Rs. 2,000
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: TYPE OF PLANTS --- */}
          {activeCategory === "type" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {plantTypeOptions.map((opt) => {
                  const isChecked = draftFilters.plantTypes.includes(opt.value);
                  const count = countPlants((p) =>
                    (p.category || "").toLowerCase().includes(opt.value.toLowerCase())
                  );
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("plantTypes", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: PLANT SIZE --- */}
          {activeCategory === "size" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {sizeOptions.map((opt) => {
                  const isChecked = draftFilters.sizes.includes(opt.value);
                  const count = countPlants((p) =>
                    (p.size || "").toLowerCase().includes(opt.value.toLowerCase())
                  );
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("sizes", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: LIGHT --- */}
          {activeCategory === "light" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {lightOptions.map((opt) => {
                  const isChecked = draftFilters.lights.includes(opt.value);
                  const count = countPlants((p) =>
                    (p.light || "").toLowerCase().includes(opt.value.toLowerCase())
                  );
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("lights", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: LOCATION --- */}
          {activeCategory === "location" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {locationOptions.map((opt) => {
                  const isChecked = draftFilters.locations.includes(opt.value);
                  const count = countPlants((p) => {
                    const rooms = Array.isArray(p.rooms)
                      ? p.rooms
                      : typeof p.rooms === "string"
                      ? [p.rooms]
                      : [];
                    return rooms.some((r: string) =>
                      r.toLowerCase().includes(opt.value.toLowerCase())
                    );
                  });
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("locations", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: INDOOR/OUTDOOR --- */}
          {activeCategory === "environment" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {environmentOptions.map((opt) => {
                  const isChecked = draftFilters.environment.includes(opt.value);
                  const count = countPlants((p) => {
                    if (opt.value === "indoor") {
                      return !(p.category || "").toLowerCase().includes("outdoor");
                    }
                    return (
                      (p.category || "").toLowerCase().includes("outdoor") ||
                      (Array.isArray(p.rooms) && p.rooms.includes("balcony"))
                    );
                  });
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("environment", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: MAINTENANCE --- */}
          {activeCategory === "maintenance" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {maintenanceOptions.map((opt) => {
                  const isChecked = draftFilters.maintenance.includes(opt.value);
                  const count = countPlants((p) =>
                    (p.difficulty || "").toLowerCase().includes(opt.value.toLowerCase())
                  );
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("maintenance", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: WATER SCHEDULE --- */}
          {activeCategory === "water" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                {waterOptions.map((opt) => {
                  const isChecked = draftFilters.waterSchedule.includes(opt.value);
                  const count = countPlants((p) =>
                    (p.water || "").toLowerCase().includes(opt.value.toLowerCase())
                  );
                  return (
                    <label key={opt.value} className="ugaoo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem("waterSchedule", opt.value)}
                      />
                      <span className="ugaoo-custom-checkbox">
                        {isChecked && <Check size={13} />}
                      </span>
                      <span className="ugaoo-opt-label">{opt.label}</span>
                      <span className="ugaoo-opt-count">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SUB CATEGORY VIEW: AVAILABILITY --- */}
          {activeCategory === "availability" && (
            <div className="ugaoo-sub-view">
              <div className="ugaoo-options-list">
                <label className="ugaoo-checkbox-row">
                  <input
                    type="checkbox"
                    checked={draftFilters.inStockOnly}
                    onChange={(e) =>
                      setDraftFilters((p) => ({ ...p, inStockOnly: e.target.checked }))
                    }
                  />
                  <span className="ugaoo-custom-checkbox">
                    {draftFilters.inStockOnly && <Check size={13} />}
                  </span>
                  <span className="ugaoo-opt-label">In Stock Only</span>
                  <span className="ugaoo-opt-count">({availablePlants.length})</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="ugaoo-drawer-footer">
          {totalActiveFilters > 0 ? (
            <button
              type="button"
              className="ugaoo-reset-btn"
              onClick={handleClearAll}
            >
              Clear All ({totalActiveFilters})
            </button>
          ) : (
            <span className="ugaoo-footer-placeholder" />
          )}

          <button
            type="button"
            className="ugaoo-apply-btn"
            onClick={handleApply}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
}
