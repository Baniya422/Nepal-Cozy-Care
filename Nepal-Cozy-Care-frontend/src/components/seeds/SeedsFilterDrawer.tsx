import { useState } from "react";
import { X, ArrowLeft, ChevronRight, Check } from "lucide-react";

export type SeedsFilterValues = {
  categories: string[];
  seasons: string[];
  difficulties: string[];
  sunlights: string[];
  priceMin: number | "";
  priceMax: number | "";
  inStockOnly: boolean;
};

export const defaultSeedsFilterValues: SeedsFilterValues = {
  categories: [],
  seasons: [],
  difficulties: [],
  sunlights: [],
  priceMin: "",
  priceMax: "",
  inStockOnly: false,
};

type SeedsFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: SeedsFilterValues;
  onApply: (filters: SeedsFilterValues) => void;
  totalProductsCount: number;
};

type FilterCategoryKey = "category" | "season" | "sunlight" | "difficulty" | "price" | "availability";

interface CategoryMeta {
  key: FilterCategoryKey;
  label: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: "category", label: "Seed Variety / Type" },
  { key: "season", label: "Sowing Season" },
  { key: "sunlight", label: "Sunlight Requirements" },
  { key: "difficulty", label: "Growing Difficulty" },
  { key: "price", label: "Price Range" },
  { key: "availability", label: "Availability" },
];

const SEED_CATEGORIES = [
  { value: "Vegetable Seeds", label: "Vegetable Seeds" },
  { value: "Flower Seeds", label: "Flower Seeds" },
  { value: "Herb Seeds", label: "Culinary & Medicinal Herb Seeds" },
  { value: "Microgreens", label: "Microgreens & Germination Kits" },
  { value: "Fruit & Exotic Seeds", label: "Fruit & Exotic Seeds" },
  { value: "Combo Kits", label: "Combo Packs & Starter Kits" },
];

const SOWING_SEASONS = [
  { value: "All Season", label: "All Seasons (Year Round)" },
  { value: "Spring", label: "Spring Sowing" },
  { value: "Summer", label: "Summer Sowing" },
  { value: "Monsoon", label: "Monsoon Sowing" },
  { value: "Winter", label: "Winter / Autumn Sowing" },
];

const SUNLIGHT_OPTIONS = [
  { value: "Full Sun", label: "Full Sun (6+ Hours Daily)" },
  { value: "Partial Shade", label: "Partial Shade (3-5 Hours)" },
  { value: "Bright Indirect", label: "Bright Indirect Light" },
  { value: "Indoor Windowsill", label: "Indoor Windowsill / Kitchen" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Beginner", label: "Beginner Friendly (Easy to Grow)" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const PRICE_PRESETS: Array<{ label: string; min: number | ""; max: number | "" }> = [
  { label: "Under Rs. 150", min: "", max: 150 },
  { label: "Rs. 150 - Rs. 250", min: 150, max: 250 },
  { label: "Rs. 250 - Rs. 400", min: 250, max: 400 },
  { label: "Above Rs. 400", min: 400, max: "" },
];

export default function SeedsFilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  totalProductsCount,
}: SeedsFilterDrawerProps) {
  const [draft, setDraft] = useState<SeedsFilterValues>(filters);
  const [activeCategory, setActiveCategory] = useState<FilterCategoryKey | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setDraft((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat],
      };
    });
  };

  const toggleSeason = (season: string) => {
    setDraft((prev) => {
      const exists = prev.seasons.includes(season);
      return {
        ...prev,
        seasons: exists ? prev.seasons.filter((s) => s !== season) : [...prev.seasons, season],
      };
    });
  };

  const toggleSunlight = (sun: string) => {
    setDraft((prev) => {
      const exists = prev.sunlights.includes(sun);
      return {
        ...prev,
        sunlights: exists ? prev.sunlights.filter((s) => s !== sun) : [...prev.sunlights, sun],
      };
    });
  };

  const toggleDifficulty = (diff: string) => {
    setDraft((prev) => {
      const exists = prev.difficulties.includes(diff);
      return {
        ...prev,
        difficulties: exists ? prev.difficulties.filter((d) => d !== diff) : [...prev.difficulties, diff],
      };
    });
  };

  const setPriceRange = (min: number | "", max: number | "") => {
    setDraft((prev) => ({ ...prev, priceMin: min, priceMax: max }));
  };

  const clearAll = () => {
    setDraft(defaultSeedsFilterValues);
  };

  const countFor = (key: FilterCategoryKey): number => {
    switch (key) {
      case "category": return draft.categories.length;
      case "season": return draft.seasons.length;
      case "sunlight": return draft.sunlights.length;
      case "difficulty": return draft.difficulties.length;
      case "price": return draft.priceMin !== "" || draft.priceMax !== "" ? 1 : 0;
      case "availability": return draft.inStockOnly ? 1 : 0;
      default: return 0;
    }
  };

  const totalActiveFilters =
    draft.categories.length +
    draft.seasons.length +
    draft.sunlights.length +
    draft.difficulties.length +
    (draft.priceMin !== "" || draft.priceMax !== "" ? 1 : 0) +
    (draft.inStockOnly ? 1 : 0);

  return (
    <div className="ugaoo-filter-overlay" onClick={onClose}>
      <aside
        className="ugaoo-filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Filter Seeds"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="ugaoo-filter-header">
          {activeCategory ? (
            <button
              type="button"
              className="ugaoo-filter-back-btn"
              onClick={() => setActiveCategory(null)}
              aria-label="Back to seed filter list"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          ) : (
            <span className="ugaoo-filter-title">Filter Seeds</span>
          )}

          <button
            type="button"
            className="ugaoo-filter-close-btn"
            onClick={onClose}
            aria-label="Close seed filter drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="ugaoo-filter-body">
          {!activeCategory ? (
            <ul className="ugaoo-filter-categories-list">
              {CATEGORIES.map((cat) => {
                const count = countFor(cat.key);
                return (
                  <li key={cat.key}>
                    <button
                      type="button"
                      className="ugaoo-filter-category-row"
                      onClick={() => setActiveCategory(cat.key)}
                    >
                      <span className="ugaoo-filter-category-label">
                        {cat.label}
                        {count > 0 && <span className="ugaoo-filter-chip-count">{count}</span>}
                      </span>
                      <ChevronRight size={18} className="ugaoo-filter-chevron" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="ugaoo-filter-options-panel">
              <h3 className="ugaoo-filter-panel-title">
                {CATEGORIES.find((c) => c.key === activeCategory)?.label}
              </h3>

              {activeCategory === "category" && (
                <div className="ugaoo-filter-checkboxes">
                  {SEED_CATEGORIES.map((opt) => {
                    const isChecked = draft.categories.includes(opt.value);
                    return (
                      <label key={opt.value} className="ugaoo-filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(opt.value)}
                        />
                        <span className="ugaoo-filter-custom-checkbox">
                          {isChecked && <Check size={13} />}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {activeCategory === "season" && (
                <div className="ugaoo-filter-checkboxes">
                  {SOWING_SEASONS.map((opt) => {
                    const isChecked = draft.seasons.includes(opt.value);
                    return (
                      <label key={opt.value} className="ugaoo-filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSeason(opt.value)}
                        />
                        <span className="ugaoo-filter-custom-checkbox">
                          {isChecked && <Check size={13} />}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {activeCategory === "sunlight" && (
                <div className="ugaoo-filter-checkboxes">
                  {SUNLIGHT_OPTIONS.map((opt) => {
                    const isChecked = draft.sunlights.includes(opt.value);
                    return (
                      <label key={opt.value} className="ugaoo-filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSunlight(opt.value)}
                        />
                        <span className="ugaoo-filter-custom-checkbox">
                          {isChecked && <Check size={13} />}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {activeCategory === "difficulty" && (
                <div className="ugaoo-filter-checkboxes">
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const isChecked = draft.difficulties.includes(opt.value);
                    return (
                      <label key={opt.value} className="ugaoo-filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDifficulty(opt.value)}
                        />
                        <span className="ugaoo-filter-custom-checkbox">
                          {isChecked && <Check size={13} />}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {activeCategory === "price" && (
                <div className="ugaoo-filter-price-panel">
                  <div className="ugaoo-filter-presets">
                    {PRICE_PRESETS.map((preset) => {
                      const isActive = draft.priceMin === preset.min && draft.priceMax === preset.max;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          className={`ugaoo-filter-preset-pill ${isActive ? "is-active" : ""}`}
                          onClick={() => setPriceRange(preset.min, preset.max)}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="ugaoo-filter-custom-price-row">
                    <input
                      type="number"
                      placeholder="Min (Rs.)"
                      value={draft.priceMin}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          priceMin: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      className="ugaoo-filter-price-input"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      placeholder="Max (Rs.)"
                      value={draft.priceMax}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          priceMax: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      className="ugaoo-filter-price-input"
                    />
                  </div>
                </div>
              )}

              {activeCategory === "availability" && (
                <div className="ugaoo-filter-checkboxes">
                  <label className="ugaoo-filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={draft.inStockOnly}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, inStockOnly: e.target.checked }))
                      }
                    />
                    <span className="ugaoo-filter-custom-checkbox">
                      {draft.inStockOnly && <Check size={13} />}
                    </span>
                    <span>In Stock Only</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="ugaoo-filter-footer">
          <button
            type="button"
            className="ugaoo-filter-clear-btn"
            onClick={clearAll}
            disabled={totalActiveFilters === 0}
          >
            Clear All
          </button>
          <button
            type="button"
            className="ugaoo-filter-apply-btn"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply ({totalProductsCount})
          </button>
        </div>
      </aside>
    </div>
  );
}
