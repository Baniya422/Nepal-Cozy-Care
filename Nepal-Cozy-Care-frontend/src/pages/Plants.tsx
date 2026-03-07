import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import FilterSidebar from "../components/plants/FilterSidebar";
import ProductGrid from "../components/plants/ProductGrid";
import "../styles/plants.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
  category?: string;
  size?: string;
  light?: string;
  difficulty?: string;
  is_active?: boolean;
};

export default function Plants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const response = await fetch(`${API}/api/plants?per_page=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let plantsData = data.data?.plants || data.data?.data || [];
      
      // Convert price to number (backend sends it as string)
      plantsData = plantsData.map((plant: any) => ({
        ...plant,
        price: parseFloat(plant.price) || 0,
        avg_rating: parseFloat(plant.avg_rating) || 0,
      }));
      
      // Exclude pots, tools, soil, fertilizers, and accessories - those belong on Pots page
      plantsData = plantsData.filter((plant: any) => {
        const category = (plant.category || "").toLowerCase().trim();
        return !category.includes("pot") && 
               !category.includes("tool") && 
               !category.includes("soil") && 
               !category.includes("fertilizer") && 
               !category.includes("accessory");
      });
      
      setPlants(plantsData);
      setFilteredPlants(plantsData);
      
      if (plantsData.length === 0) {
        setError("No plants found in the database. Please add some plants from the admin panel.");
      }
    } catch (err) {
      setError("Failed to load plants. Please check if the backend server is running.");
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
        selectedLightTypes.some(type => 
          plant.light?.toLowerCase().includes(type.toLowerCase())
        )
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
        <FilterSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLightTypes={selectedLightTypes}
          selectedCategories={selectedCategories}
          selectedSizes={selectedSizes}
          selectedPlantTypes={selectedPlantTypes}
          selectedPriceRanges={selectedPriceRanges}
          toggleFilter={toggleFilter}
          setSelectedLightTypes={setSelectedLightTypes}
          setSelectedCategories={setSelectedCategories}
          setSelectedSizes={setSelectedSizes}
          setSelectedPlantTypes={setSelectedPlantTypes}
          setSelectedPriceRanges={setSelectedPriceRanges}
        />

        <main className="plants-main">
          <div className="plants-header">
            <h1 className="plants-page-title">Plants</h1>
            <p className="plants-results-count">
              {loading ? "Loading..." : `${filteredPlants.length} products found`}
            </p>
          </div>

          <ProductGrid 
            plants={filteredPlants} 
            loading={loading} 
            error={error}
            fetchPlants={fetchPlants}
          />
        </main>
      </div>
    </Layout>
  );
}
