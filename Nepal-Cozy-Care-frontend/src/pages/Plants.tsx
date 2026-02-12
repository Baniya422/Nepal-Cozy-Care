import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Heart, Search } from "lucide-react";
import "../styles/plants.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
  category?: string;
  light_requirement?: string;
  size?: string;
};

export default function Plants() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [selectedLightTypes, setSelectedLightTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPlantTypes, setSelectedPlantTypes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [plants, searchTerm, selectedLightTypes, selectedCategories, selectedSizes, selectedPlantTypes, selectedPriceRanges]);

  const fetchPlants = async () => {
    try {
      const response = await fetch(`${API}/api/plants?per_page=100`);
      const data = await response.json();
      setPlants(data.data.data || []);
      setFilteredPlants(data.data.data || []);
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Light type filter
    if (selectedLightTypes.length > 0) {
      filtered = filtered.filter(plant =>
        selectedLightTypes.includes(plant.light_requirement || "")
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(plant =>
        selectedCategories.includes(plant.category || "")
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(plant =>
        selectedSizes.includes(plant.size || "")
      );
    }

    // Plant type filter
    if (selectedPlantTypes.length > 0) {
      filtered = filtered.filter(plant =>
        selectedPlantTypes.includes(plant.category || "")
      );
    }

    // Price filter
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(plant => {
        return selectedPriceRanges.some(range => {
          if (range === "under-500") return plant.price < 500;
          if (range === "500-1000") return plant.price >= 500 && plant.price <= 1000;
          if (range === "1000-2000") return plant.price > 1000 && plant.price <= 2000;
          if (range === "over-2000") return plant.price > 2000;
          return true;
        });
      });
    }

    setFilteredPlants(filtered);
  };

  const toggleFilter = (filterArray: string[], setFilterArray: (val: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter(item => item !== value));
    } else {
      setFilterArray([...filterArray, value]);
    }
  };

  return (
    <Layout>
      <div className="plants-page">
        {/* Sidebar Filters */}
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
            <h4 className="plants-filter-subtitle">Plant</h4>
            <div className="plants-filter-options">
              {["Sunny", "Indirect light", "Green House", "Shade"].map(type => (
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
              {["Bedroom", "Decor", "Decoration", "Kitchen", "Living", "Lighting", "Mood"].map(category => (
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

        {/* Main Content */}
        <main className="plants-main">
          <div className="plants-header">
            <h1 className="plants-page-title">Plants</h1>
            <p className="plants-results-count">
              {loading ? "Loading..." : `${filteredPlants.length} products found`}
            </p>
          </div>

          {/* Plants Grid */}
          <div className="plants-grid">
            {filteredPlants.map((plant) => (
              <div key={plant.id} className="plants-card">
                <div className="plants-card-image-wrapper">
                  <img
                    src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                    alt={plant.name}
                    className="plants-card-image"
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  />
                  <button className="plants-wishlist-btn">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="plants-card-content">
                  <h3 className="plants-card-name">{plant.name}</h3>
                  <p className="plants-card-category">{plant.category || "Indoor Plant"}</p>
                  <p className="plants-card-price">RS {plant.price.toFixed(2)}</p>
                  <div className="plants-card-rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.floor(plant.avg_rating || 5) ? "star-filled" : "star-empty"}
                      >
                        ★
                      </span>
                    ))}
                    <span className="plants-rating-count">({plant.avg_rating || 5})</span>
                  </div>
                  <button 
                    className="plants-view-btn"
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  >
                    View All
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPlants.length === 0 && !loading && (
            <div className="plants-no-results">
              <p>No plants found matching your filters.</p>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
