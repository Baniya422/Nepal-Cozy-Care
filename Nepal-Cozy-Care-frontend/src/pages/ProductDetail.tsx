import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Breadcrumb from '../components/product-detail/Breadcrumb';
import ProductImage from '../components/product-detail/ProductImage';
import ProductInfo from '../components/product-detail/ProductInfo';
import InfoSections from '../components/product-detail/InfoSections';
import WhyChooseUs from '../components/product-detail/WhyChooseUs';
import '../styles/productDetail.css';

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Plant {
  id: number;
  name: string;
  scientific_name?: string;
  description?: string;
  survival_guide?: string;
  care_instructions?: string;
  price: number;
  stock: number;
  category?: string;
  size?: string;
  light?: string;
  water?: string;
  temperature?: string;
  humidity?: string;
  fertilizer?: string;
  difficulty?: string;
  image?: string;
  avg_rating?: number;
  review_count?: number;
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedPot, setSelectedPot] = useState<number | null>(null);

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    try {
      const response = await fetch(`${API}/api/plants/${id}`);
      const data = await response.json();
      if (data.data?.plant) {
        const plantData = data.data.plant;
        plantData.price = parseFloat(plantData.price) || 0;
        plantData.avg_rating = parseFloat(plantData.avg_rating) || 0;
        setPlant(plantData);
      }
    } catch (error) {
      console.error("Error fetching plant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} ${plant?.name} to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <Layout>
        <div className="product-page">
          <div className="product-container">
            <div className="product-skeleton">
              <div className="skeleton-image-section"></div>
              <div className="skeleton-info-section"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!plant) {
    return (
      <Layout>
        <div className="product-page">
          <div className="product-container">
            <div className="product-not-found">
              <h2>Product Not Found</h2>
              <button onClick={() => navigate('/plants')} className="btn-primary">
                Browse Plants
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="product-page">
        <div className="product-container">
          <Breadcrumb productName={plant.name} />

          <div className="product-main">
            <ProductImage image={plant.image} name={plant.name} />
            <ProductInfo
              name={plant.name}
              price={plant.price}
              size={plant.size}
              avgRating={plant.avg_rating}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedPot={selectedPot}
              setSelectedPot={setSelectedPot}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>

          <InfoSections plant={plant} />
          <WhyChooseUs />
        </div>
      </div>
    </Layout>
  );
}
