import { useState } from "react";
import { X, ArrowLeft, ChevronRight, Check } from "lucide-react";

export type AccessoriesFilterValues = {
  categories: string[];
  priceMin: number | "";
  priceMax: number | "";
  inStockOnly: boolean;
};

export const defaultAccessoriesFilterValues: AccessoriesFilterValues = {
  categories: [],
  priceMin: "",
  priceMax: "",
  inStockOnly: false,
};

type AccessoriesFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: AccessoriesFilterValues;
  onApply: (filters: AccessoriesFilterValues) => void;
  totalProductsCount: number;
};

type FilterCategoryKey = "category" | "price" | "availability";

interface CategoryMeta {
  key: FilterCategoryKey;
  label: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: "category", label: "Category" },
  { key: "price", label: "Price Range" },
  { key: "availability", label: "Availability" },
];

const ACCESSORY_CATEGORIES = [
  { value: "pots", label: "Pots & Planters" },
  { value: "soil", label: "Soil & Growing Media" },
  { value: "fertilizer", label: "Fertilisers & Plant Food" },
  { value: "tools", label: "Garden Tools & Accessories" },
  { value: "watering", label: "Watering Cans & Sprayers" },
];

const PRICE_PRESETS: Array<{ label: string; min: number | ""; max: number | "" }> = [
  { label: "Under Rs. 500", min: "", max: 500 },
  { label: "Rs. 500 - Rs. 1,000", min: 500, max: 1000 },
  { label: "Rs. 1,000 - Rs. 2,000", min: 1000, max: 2000 },
  { label: "Above Rs. 2,000", min: 2000, max: "" },
];

export default function AccessoriesFilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  totalProductsCount,
}: AccessoriesFilterDrawerProps) {
  const [draft, setDraft] = useState<AccessoriesFilterValues>(filters);
  const [activeCategory, setActiveCategory] = useState<FilterCategoryKey | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setDraft((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const setPriceRange = (min: number | "", max: number | "") => {
    setDraft((prev) => ({
      ...prev,
      priceMin: min,
      priceMax: max,
    }));
  };

  const getActiveCountForCategory = (key: FilterCategoryKey): number => {
    switch (key) {
      case "category":
        return draft.categories.length;
      case "price":
        return draft.priceMin !== "" || draft.priceMax !== "" ? 1 : 0;
      case "availability":
        return draft.inStockOnly ? 1 : 0;
      default:
        return 0;
    }
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClearAll = () => {
    setDraft(defaultAccessoriesFilterValues);
  };

  return (
    <div className="ugaoo-drawer-backdrop" onClick={onClose}>
      <div
        className="ugaoo-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="ugaoo-drawer-header">
          {activeCategory ? (
            <div className="ugaoo-sub-header">
              <button
                type="button"
                className="ugaoo-back-btn"
                onClick={() => setActiveCategory(null)}
                aria-label="Back to filter list"
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

        {/* Body */}
        <div className="ugaoo-drawer-body">
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

          {/* Category detail */}
          {activeCategory === "category" && (
            <div className="ugaoo-options-list">
              {ACCESSORY_CATEGORIES.map((cat) => {
                const isChecked = draft.categories.includes(cat.value);
                return (
                  <label key={cat.value} className="ugaoo-option-row">
                    <span className="ugaoo-option-label">{cat.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.value)}
                      className="sr-only"
                    />
                    <div className={`ugaoo-checkbox-custom ${isChecked ? "checked" : ""}`}>
                      {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Price detail */}
          {activeCategory === "price" && (
            <div className="ugaoo-options-list">
              {PRICE_PRESETS.map((p, idx) => {
                const isChecked =
                  draft.priceMin === p.min && draft.priceMax === p.max;
                return (
                  <label key={idx} className="ugaoo-option-row">
                    <span className="ugaoo-option-label">{p.label}</span>
                    <input
                      type="radio"
                      name="accessory-price"
                      checked={isChecked}
                      onChange={() => setPriceRange(p.min, p.max)}
                      className="sr-only"
                    />
                    <div className={`ugaoo-checkbox-custom ${isChecked ? "checked" : ""}`}>
                      {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Availability detail */}
          {activeCategory === "availability" && (
            <div className="ugaoo-options-list">
              <label className="ugaoo-option-row">
                <span className="ugaoo-option-label">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={draft.inStockOnly}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      inStockOnly: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`ugaoo-checkbox-custom ${
                    draft.inStockOnly ? "checked" : ""
                  }`}
                >
                  {draft.inStockOnly && <Check size={14} color="#fff" strokeWidth={3} />}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ugaoo-drawer-footer">
          <button
            type="button"
            className="ugaoo-drawer-clear-btn"
            onClick={handleClearAll}
          >
            Clear All
          </button>
          <button
            type="button"
            className="ugaoo-drawer-apply-btn"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
