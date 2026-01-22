import { Search, SlidersHorizontal } from "lucide-react";
import type { SortChoice } from "../types";

type CatalogHeaderProps = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchTerm: string;
  sortValue: string;
  sortOptions: SortChoice[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export default function CatalogHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchTerm,
  sortValue,
  sortOptions,
  onSearchChange,
  onSortChange,
}: CatalogHeaderProps) {
  return (
    <header className="popular-header">
      <div>
        <h1 className="popular-title">{title}</h1>
        <p className="popular-subtitle">{subtitle}</p>
      </div>

      <div className="popular-header-actions">
        <div className="popular-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <button className="popular-filter-btn" type="button">
          <SlidersHorizontal size={16} />
          Filters
        </button>

        <div className="popular-sort">
          <span>Sort by</span>
          <select
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value)}
            className="popular-sort-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
