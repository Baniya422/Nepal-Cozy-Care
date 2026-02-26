import { Filter } from "lucide-react";

interface FiltersProps {
  categories: Record<string, string>;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  clearFilters: () => void;
  total: number;
  hasActiveFilters: boolean;
}

export default function Filters({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  sortBy,
  setSortBy,
  clearFilters,
  total,
  hasActiveFilters,
}: FiltersProps) {
  return (
    <section className="care-tips-filters-section">
      <div className="care-tips-container">
        <div className="care-tips-filters">
          <div className="care-tips-filter-group">
            <Filter size={18} />
            <span className="care-tips-filter-label">Filter by:</span>
          </div>

          {/* Category Filter */}
          <div className="care-tips-filter-dropdown">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="care-tips-filter-select"
            >
              <option value="">All Categories</option>
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="care-tips-filter-dropdown">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="care-tips-filter-select"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Sort */}
          <div className="care-tips-filter-dropdown">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="care-tips-filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="care-tips-clear-filters">
              Clear Filters
            </button>
          )}
        </div>

        <div className="care-tips-results-count">
          {total} {total === 1 ? "tip" : "tips"} found
        </div>
      </div>
    </section>
  );
}
