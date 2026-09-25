import { useNavigate, Link } from "react-router-dom";
import { Heart, Star, ShoppingBag, Store, ShieldCheck } from "lucide-react";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE, DEFAULT_POT_IMAGE } from "../../utils/imageUrl";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useWishlist } from "../../hooks/useWishlist";
import { getProductPricing } from "../../utils/productPricing";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";


export interface ProductCardData {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  category?: string;
  subtitle?: string;
  description?: string;
  avg_rating?: number | string;
  review_count?: number;
  badge?: string | null;
  discount_percent?: number;
  is_best_seller?: boolean;
  is_popular_item?: boolean;
  stock?: number;
  total_sold?: number;
  shop?: {
    name: string;
    slug: string;
    is_verified?: boolean;
  };
}

interface ProductCardProps {
  product: ProductCardData;
  index?: number;
  badge?: string | null;
  isWishlisted?: boolean;
  isWishlistBusy?: boolean;
  onToggleWishlist?: (id: number) => void;
  onAddToCart?: (id: number, name: string) => void;
  isCartBusy?: boolean;
  showSoldCount?: boolean;
  defaultFallbackImage?: string;
}

export default function ProductCard({
  product,
  index = 0,
  badge: explicitBadge,
  isWishlisted: propIsWishlisted,
  isWishlistBusy: propIsWishlistBusy,
  onToggleWishlist: propOnToggleWishlist,
  onAddToCart: propOnAddToCart,
  isCartBusy: propIsCartBusy,
  showSoldCount = false,
  defaultFallbackImage,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { vendor_marketplace_enabled } = useFeatureFlags();

  // Hooks for standalone usage if callbacks aren't supplied
  const fallbackWishlist = useWishlist({
    apiBaseUrl: API,
    enabled: propIsWishlisted === undefined || !propOnToggleWishlist,
  });
  const fallbackCart = useAddToCart(API);

  const isWishlisted =
    propIsWishlisted !== undefined
      ? propIsWishlisted
      : fallbackWishlist.wishlistIds.includes(product.id);

  const isWishlistBusy =
    propIsWishlistBusy !== undefined
      ? propIsWishlistBusy
      : fallbackWishlist.wishlistBusyId === product.id;

  const handleToggleWishlist = () => {
    if (propOnToggleWishlist) {
      propOnToggleWishlist(product.id);
    } else {
      void fallbackWishlist.toggleWishlist(product.id);
    }
  };

  const isCartBusy =
    propIsCartBusy !== undefined
      ? propIsCartBusy
      : fallbackCart.cartBusyId === product.id;

  const handleAddToCart = () => {
    if (propOnAddToCart) {
      propOnAddToCart(product.id, product.name);
    } else {
      void fallbackCart.addToCart({ id: product.id, name: product.name });
    }
  };

  const isAccessory =
    product.category &&
    /pot|planter|tool|soil|fertilizer|accessory|watering/i.test(product.category);

  const fallbackImage =
    defaultFallbackImage || (isAccessory ? DEFAULT_POT_IMAGE : DEFAULT_PLANT_IMAGE);

  // Badge logic matching Home page
  const resolvedBadge =
    explicitBadge !== undefined
      ? explicitBadge
      : product.badge || (product.is_best_seller ? "BESTSELLER" : product.is_popular_item ? "POPULAR" : null);

  const { sellingPrice: numericPrice, discountPercent, originalPrice } =
    getProductPricing(product.price, product.discount_percent);

  // Rating & Review count
  const rating =
    Number(product.avg_rating) > 0
      ? Number(product.avg_rating).toFixed(1)
      : "New";
  const reviewCount =
    product.review_count ?? 0;

  // Subtitle
  const subtitle =
    product.subtitle ||
    (product.description
      ? product.description.length > 52
        ? product.description.slice(0, 52) + "..."
        : product.description
      : product.category
      ? `${product.category} - fresh nursery quality`
      : "Low-maintenance, air-purifying indoor plant");

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        {/* Top-Left Badge (BESTSELLER / TRENDING / FEATURED) */}
        {resolvedBadge ? (
          <span className="product-badge-bestseller">{resolvedBadge}</span>
        ) : null}

        {/* Top-Right Discount Badge */}
        {discountPercent > 0 ? (
          <span className="product-badge-discount">{discountPercent}% OFF</span>
        ) : null}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          disabled={isWishlistBusy}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* Product Image */}
        <img
          src={resolveImageUrl(product.image, fallbackImage)}
          alt={product.name}
          className="product-image"
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          onError={(e) => handleImageError(e, fallbackImage)}
          onClick={() => navigate(`/plants/${product.id}`)}
        />

        {/* Bottom-Left Rating Pill */}
        <div className="product-rating-pill">
          <span className="rating-score">{rating}</span>
          <Star size={11} fill="#eab308" color="#eab308" />
          <span className="rating-divider">|</span>
          <span className="rating-count">{reviewCount}</span>
        </div>
      </div>

      <div className="product-info">
        <div className="product-text-group">
          <h3
            className="product-name"
            title={product.name}
            onClick={() => navigate(`/plants/${product.id}`)}
          >
            {product.name}
          </h3>
          <p className="product-subtitle" title={subtitle}>
            {subtitle}
          </p>
        </div>

        {vendor_marketplace_enabled && product.shop && (
          <Link
            to={`/shops/${product.shop.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 transition mb-1"
          >
            <Store size={12} className="text-emerald-600" />
            <span>Sold by {product.shop.name}</span>
            {product.shop.is_verified && (
              <ShieldCheck size={11} className="text-emerald-600" />
            )}
          </Link>
        )}

        {showSoldCount ? (
          <p className="product-card-sales">
            Sold: {product.total_sold ?? 0} units
          </p>
        ) : null}

        <div className="product-bottom-row">
          <div className="product-price-box">
            <span className="product-price">
              Rs. {numericPrice.toLocaleString()}
            </span>
            {discountPercent > 0 && <span className="product-compare-price">
              Rs. {originalPrice.toLocaleString()}
            </span>}
          </div>

          <div className="product-actions-group">
            <button
              type="button"
              className="view-product-btn"
              onClick={() => navigate(`/plants/${product.id}`)}
            >
              View Product
            </button>
            <button
              type="button"
              className="quick-cart-btn"
              onClick={handleAddToCart}
              disabled={isCartBusy || product.stock === 0}
              title={product.stock === 0 ? "Out of stock" : `Add ${product.name} to cart`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
