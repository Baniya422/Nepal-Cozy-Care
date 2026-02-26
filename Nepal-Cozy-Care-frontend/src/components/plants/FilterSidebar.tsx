import { Search } from "lucide-react";

interface FilterSidebarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLightTypes: string[];
  selectedCategories: string[];
  selectedSizes: string[];
  selectedPlantTypes: string[];
  selectedPriceRanges: string[];
  toggleFilter: (filterArray: string[], setFilterArray: (val: string[]) => void, value: string) => void;
  setSelectedLightTypes: (val: string[]) => void;
  setSelectedCategories: (val: string[]) => void;
  setSelectedSizes: (val: string[]) => void;
  setSelectedPlantTypes: (val: string[]) => void;
  setSelectedPriceRanges: (val: string[]) => void;
}

export default function FilterSidebar({
  searchTerm,
  setSearchTerm,
  selectedLightTypes,
  selectedCategories,
  selectedSizes,
  selectedPlantTypes,
  selectedPriceRanges,
  toggleFilter,
  setSelectedLightTypes,
  setSelectedCategories,
  setSelectedSizes,
  setSelectedPlantTypes,
  setSelectedPriceRanges,
}: FilterSidebarProps) {
  return (
    <aside className="plants-sidebar">
      <div className="plants-filter-section">
        <h3 className="plants-filter-title">Filter :</h3>
        
        {/* Search */}
        <div className="plants-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="plants-search-input"
          />
        </div>
      </div>

      {/* Plant Light Requirements */}
      <div className="plants-filter-section">
        <h4 className="plants-filter-subtitle">Light Requirements</h4>
        <div className="plants-filter-options">
          {["Bright", "Indirect", "Low light", "Shade"].map(type => (
            <label key={type} className="plants-filter-option">
              <input
                type="checkbox"
                checked={selectedLightTypes.includes(type)}
                onChange={() => toggleFilter(selectedLightTypes, setSelectedLightTypes, type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="plants-filter-section">
        <h4 className="plants-filter-subtitle">Category</h4>
        <div className="plants-filter-options">
          {["Indoor", "Outdoor", "Succulent", "Flowering"].map(category => (
            <label key={category} className="plants-filter-option">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="plants-filter-section">
        <h4 className="plants-filter-subtitle">Size</h4>
        <div className="plants-filter-options">
          {["Small", "Medium", "Large", "Extra Large"].map(size => (
            <label key={size} className="plants-filter-option">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
              />
              <span>{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Plant Type */}
      <div className="plants-filter-section">
        <h4 className="plants-filter-subtitle">Plant Type</h4>
        <div className="plants-filter-options">
          {["Indoor", "Outdoor", "Succulent", "Flowering"].map(type => (
            <label key={type} className="plants-filter-option">
              <input
                type="checkbox"
                checked={selectedPlantTypes.includes(type)}
                onChange={() => toggleFilter(selectedPlantTypes, setSelectedPlantTypes, type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="plants-filter-section">
        <h4 className="plants-filter-subtitle">Price</h4>
        <div className="plants-filter-options">
          <label className="plants-filter-option">
            <input
              type="checkbox"
              checked={selectedPriceRanges.includes("under-500")}
              onChange={() => toggleFilter(selectedPriceRanges, setSelectedPriceRanges, "under-500")}
            />
            <span>Under Rs 500</span>
          </label>
          <label className="plants-filter-option">
            <input
              type="checkbox"
              checked={selectedPriceRanges.includes("500-1000")}
              onChange={() => toggleFilter(selectedPriceRanges, setSelectedPriceRanges, "500-1000")}
            />
            <span>Rs 500 - Rs 1000</span>
          </label>
          <label className="plants-filter-option">
            <input
              type="checkbox"
              checked={selectedPriceRanges.includes("1000-2000")}
              onChange={() => toggleFilter(selectedPriceRanges, setSelectedPriceRanges, "1000-2000")}
            />
            <span>Rs 1000 - Rs 2000</span>
          </label>
          <label className="plants-filter-option">
            <input
              type="checkbox"
              checked={selectedPriceRanges.includes("over-2000")}
              onChange={() => toggleFilter(selectedPriceRanges, setSelectedPriceRanges, "over-2000")}
            />
            <span>Over Rs 2000</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
