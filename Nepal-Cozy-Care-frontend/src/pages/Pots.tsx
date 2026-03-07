import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import PotsHeader from "../components/pots/PotsHeader";
import PotsSidebar from "../components/pots/PotsSidebar";
import PotsGrid from "../components/pots/PotsGrid";
import "../styles/pots.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Pot = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  is_active?: boolean;
};

export default function Pots() {
  const [pots, setPots] = useState<Pot[]>([]);
  const [filteredPots, setFilteredPots] = useState<Pot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  // Load pots on mount
  useEffect(() => {
    fetchPots();
  }, []);

  const fetchPots = async () => {
    try {
      const response = await fetch(`${API}/api/plants?per_page=100&include_accessories=1`);
      if (!response.ok) {
        setPots([]);
        setFilteredPots([]);
        return;
      }

      const data = await response.json();
      const plantsData = data.data?.plants || data.data?.data || data.data || [];
      const normalizedPlants = (Array.isArray(plantsData) ? plantsData : []).map((item: any) => ({
        ...item,
        price: typeof item.price === "string" ? parseFloat(item.price) : item.price || 0,
      }));

      // Filter for items with category "Pots", "Tools", "Soil", "Fertilizers", or "Accessories" (case-insensitive)
      const backendPots = normalizedPlants.filter((item: Pot) => {
        const category = (item.category || "").toLowerCase().trim();
        return category.includes("pot") || 
               category.includes("tool") || 
               category.includes("soil") || 
               category.includes("fertilizer") || 
               category.includes("accessory");
      });

      setPots(backendPots);
      setFilteredPots(backendPots);
    } catch (error) {
      console.error("Error fetching pots:", error);
      setPots([]);
      setFilteredPots([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategories, selectedPrice, pots]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...pots];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((pot) =>
        pot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pot.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((pot) =>
        selectedCategories.includes(pot.category)
      );
    }

    // Price filter
    if (selectedPrice.length > 0) {
      filtered = filtered.filter((pot) => {
        return selectedPrice.some((range) => {
          if (range === "under-10") return pot.price < 10;
          if (range === "10-20") return pot.price >= 10 && pot.price < 20;
          if (range === "20-30") return pot.price >= 20 && pot.price < 30;
          if (range === "over-30") return pot.price >= 30;
          return true;
        });
      });
    }

    setFilteredPots(filtered);
  };

  // Update filters
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (range: string) => {
    setSelectedPrice((prev) =>
      prev.includes(range)
        ? prev.filter((r) => r !== range)
        : [...prev, range]
    );
  };

  const handleAddToCart = (pot: Pot) => {
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cartItems.find((item: any) => item.id === pot.id && item.type === "pot");

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({
        id: pot.id,
        name: pot.name,
        price: pot.price,
        type: "pot",
        quantity: 1,
        image: pot.image,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    alert(`${pot.name} added to cart!`);
  };

  const toggleWishlist = (potId: number) => {
    setWishlistIds((prev) =>
      prev.includes(potId) ? prev.filter((id) => id !== potId) : [...prev, potId]
    );
  };

  return (
    <Layout>
      <div className="pots-page">
        <PotsHeader />

        <div className="pots-container">
          <PotsSidebar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategories={selectedCategories}
            handleCategoryChange={handleCategoryChange}
            selectedPrice={selectedPrice}
            handlePriceChange={handlePriceChange}
          />

          <PotsGrid
            filteredPots={filteredPots}
            pots={pots}
            loading={loading}
            wishlistIds={wishlistIds}
            toggleWishlist={toggleWishlist}
            handleAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </Layout>
  );
}
