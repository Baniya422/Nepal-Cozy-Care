import { categoryFilterOptions } from "../data";
import type { CategoryFilter } from "../types";

type CatalogCategoryChipsProps = {
  category: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
};

export default function CatalogCategoryChips({
  category,
  onChange,
}: CatalogCategoryChipsProps) {
  return (
    <div className="popular-chips-row">
      {categoryFilterOptions.map((option) => (
        <button
          key={option.value}
          className={`popular-chip ${
            category === option.value ? "popular-chip-active" : ""
          }`}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
