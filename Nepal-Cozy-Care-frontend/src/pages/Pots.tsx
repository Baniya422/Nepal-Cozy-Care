import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import PotsHeader from "../components/pots/PotsHeader";
import PotsSidebar from "../components/pots/PotsSidebar";
import PotsGrid from "../components/pots/PotsGrid";
import "../styles/pots.css";

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

// Mock data - In production, this would come from the backend
const mockPots: Pot[] = [
  {
    id: 1,
    name: "Ceramic Pot - Small (4 inch)",
    category: "Ceramic",
    price: 12.99,
    stock: 67,
    is_active: true,
    image: "pot1.jpg",
    description: "Beautiful ceramic pot perfect for small indoor plants",
  },
  {
    id: 2,
    name: "Ceramic Pot - Medium (6 inch)",
    category: "Ceramic",
    price: 18.99,
    stock: 45,
    is_active: true,
    image: "pot2.jpg",
    description: "Versatile ceramic pot ideal for medium-sized plants",
  },
  {
    id: 3,
    name: "Ceramic Pot - Large (8 inch)",
    category: "Ceramic",
    price: 24.99,
    stock: 32,
    is_active: true,
    image: "pot3.jpg",
    description: "Large ceramic pot for bigger plants",
  },
  {
    id: 4,
    name: "Terracotta Pot - Small (4 inch)",
    category: "Terracotta",
    price: 9.99,
    stock: 89,
    is_active: true,
    image: "pot4.jpg",
    description: "Classic terracotta pot with excellent drainage",
  },
  {
    id: 5,
    name: "Terracotta Pot - Medium (6 inch)",
    category: "Terracotta",
    price: 14.99,
    stock: 56,
    is_active: true,
    image: "pot5.jpg",
    description: "Traditional terracotta pot perfect for succulents",
  },
  {
    id: 6,
    name: "Terracotta Pot - Large (8 inch)",
    category: "Terracotta",
    price: 19.99,
    stock: 41,
    is_active: true,
    image: "pot6.jpg",
    description: "Large terracotta pot for outdoor plants",
  },
  {
    id: 7,
    name: "Plastic Pot with Drainage - Small",
    category: "Plastic",
    price: 4.99,
    stock: 150,
    is_active: true,
    image: "pot7.jpg",
    description: "Lightweight plastic pot with excellent drainage holes",
  },
  {
    id: 8,
    name: "Plastic Pot with Drainage - Medium",
    category: "Plastic",
    price: 7.99,
    stock: 120,
    is_active: true,
    image: "pot8.jpg",
    description: "Durable plastic pot for indoor and outdoor use",
  },
  {
    id: 9,
    name: "Modern Concrete Pot",
    category: "Modern",
    price: 34.99,
    stock: 25,
    is_active: true,
    image: "pot9.jpg",
    description: "Industrial-style concrete pot for contemporary spaces",
  },
  {
    id: 10,
    name: "Hanging Macramé Pot Holder",
    category: "Accessories",
    price: 16.99,
    stock: 38,
    is_active: true,
    image: "pot10.jpg",
    description: "Beautiful macramé holder for hanging plants",
  },
  {
    id: 11,
    name: "Self-Watering Pot - Medium",
    category: "Smart",
    price: 29.99,
    stock: 20,
    is_active: true,
    image: "pot11.jpg",
    description: "Smart pot with built-in water reservoir and indicator",
  },
  {
    id: 12,
    name: "Decorative Plant Saucer Set",
    category: "Accessories",
    price: 11.99,
    stock: 64,
    is_active: true,
    image: "pot12.jpg",
    description: "Set of 3 decorative saucers to protect floors",
  },
];

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
    setPots(mockPots);
    setFilteredPots(mockPots);
    setLoading(false);
  }, []);

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
            pots={pots}
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
