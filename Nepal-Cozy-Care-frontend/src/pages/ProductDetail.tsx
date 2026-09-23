import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Breadcrumb from '../components/product-detail/Breadcrumb';
import ProductImage from '../components/product-detail/ProductImage';
import ProductInfo from '../components/product-detail/ProductInfo';
import InfoSections from '../components/product-detail/InfoSections';
import WhyChooseUs from '../components/product-detail/WhyChooseUs';
import SEO from '../components/common/SEO';
import '../styles/productDetail.css';
import { useWishlist } from '../hooks/useWishlist';
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
  meta_title?: string;
  meta_description?: string;
  shop?: {
    id: number;
    name: string;
    slug: string;
    is_verified?: boolean;
    logo?: string | null;
  };
}
export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const purchaseLock = useRef(false);
  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setPlant(null);
    setQuantity(1);
    setMessage("");
    setLoadError(false);
    const fetchPlant = async () => {
      try {
        const response = await fetch(`${API}/api/plants/${id}`, { signal: controller.signal });
        if (response.status === 404) return;
        if (!response.ok) throw new Error("Unable to load product");
        const data = await response.json();
        if (data.data?.plant) {
          const item = data.data.plant;
          setPlant({ ...item, price: Number(item.price) || 0, stock: Math.max(0, Number(item.stock) || 0), avg_rating: Number(item.avg_rating) || 0 });
        }
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchPlant();
    return () => controller.abort();
  }, [id, retry]);
  const handleAddToCart = async () => {
    if (!plant || plant.stock < quantity || purchaseLock.current) return false;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart.");
      navigate('/login');
      return false;
    }
    purchaseLock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plant_id: plant.id, quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Failed to add item to cart. Please try again.');
        return false;
      }
      window.dispatchEvent(new Event("cozycare:cart-updated"));
      setMessage(`Added ${quantity} ${plant.name} to your cart.`);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Could not add to cart. Please check your connection and try again.');
      return false;
    } finally {
      purchaseLock.current = false;
      setBusy(false);
    }
  };
  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) {
      navigate('/cart');
    }
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
              <h2>{loadError ? "We could not load this plant" : "Product not found"}</h2>
              {loadError && <button className="btn-primary" onClick={() => setRetry(value => value + 1)}>Try again</button>}
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
      <SEO
        title={plant.meta_title || plant.name}
        description={plant.meta_description || plant.description?.slice(0, 160) || `Buy healthy ${plant.name} online in Nepal from Cozy Care.`}
        canonicalPath={`/plants/${plant.id}`}
        image={plant.image || undefined}
        type="product"
      />
      <div className="product-page">
        <div className="product-container">
          <Breadcrumb productName={plant.name} />
          <div className="product-main">
            <ProductImage key={plant.id} image={plant.image} name={plant.name} saved={wishlistIds.includes(plant.id)} busy={wishlistBusyId === plant.id} onWishlist={() => void toggleWishlist(plant.id)} />
            <ProductInfo
              stock={plant.stock}
              scientificName={plant.scientific_name}
              description={plant.description}
              category={plant.category}
              light={plant.light}
              water={plant.water}
              difficulty={plant.difficulty}
              rating={plant.avg_rating}
              reviewCount={plant.review_count}
              busy={busy}
              message={message}
              name={plant.name}
              price={plant.price}
              size={plant.size}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              shop={plant.shop}
            />
          </div>
          <InfoSections plant={plant} />
          <WhyChooseUs />
        </div>
      </div>
    </Layout>
  );
}


