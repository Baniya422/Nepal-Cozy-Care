import { Search } from "lucide-react";

interface PotsSidebarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
  selectedPrice: string[];
  handlePriceChange: (range: string) => void;
}

export default function PotsSidebar({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  handleCategoryChange,
  selectedPrice,
  handlePriceChange,
}: PotsSidebarProps) {
  // Fixed categories matching admin form options
  const categories = ["Pots", "Tools", "Soil", "Fertilizers"];

  return (
    <aside className="pots-sidebar">
      {/* Search */}
      <div className="sidebar-section">
        <h3>Search</h3>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search pots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="sidebar-section">
        <h3>Categories</h3>
        <div className="filter-options">
          {categories.map((category) => (
            <label key={category} className="filter-item">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="sidebar-section">
        <h3>Price Range</h3>
        <div className="filter-options">
          <label className="filter-item">
            <input
              type="checkbox"
              checked={selectedPrice.includes("under-10")}
              onChange={() => handlePriceChange("under-10")}
            />
            <span>Under Rs. 10</span>
          </label>
          <label className="filter-item">
            <input
              type="checkbox"
              checked={selectedPrice.includes("10-20")}
              onChange={() => handlePriceChange("10-20")}
            />
            <span>Rs. 10 - 20</span>
          </label>
          <label className="filter-item">
            <input
              type="checkbox"
              checked={selectedPrice.includes("20-30")}
              onChange={() => handlePriceChange("20-30")}
            />
            <span>Rs. 20 - 30</span>
          </label>
          <label className="filter-item">
            <input
              type="checkbox"
              checked={selectedPrice.includes("over-30")}
              onChange={() => handlePriceChange("over-30")}
            />
            <span>Over Rs. 30</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
