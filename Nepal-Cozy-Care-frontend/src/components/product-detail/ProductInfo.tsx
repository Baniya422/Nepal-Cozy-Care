import { Link } from "react-router-dom";
import { Star, ShoppingBag, Store, ShieldCheck, Sun, Droplets, Sprout, ArrowRight } from "lucide-react";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";
import { getProductPricing } from "../../utils/productPricing";

interface ProductInfoProps {
  name: string; price: number; size?: string; stock: number;
  discountPercent?: number;
  scientificName?: string; description?: string; category?: string;
  light?: string; water?: string; difficulty?: string;
  rating?: number; reviewCount?: number;
  quantity: number; setQuantity: (q: number) => void;
  onAddToCart: () => void; onBuyNow: () => void;
  busy?: boolean; message?: string;
  shop?: { id: number; name: string; slug: string; is_verified?: boolean; logo?: string | null };
}
const money = (value: number) => `Rs. ${value.toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;
export default function ProductInfo(props: ProductInfoProps) {
  const { name, price, size, stock, scientificName, description, category, light, water, difficulty,
    rating = 0, reviewCount = 0, quantity, setQuantity, onAddToCart, onBuyNow, busy, message, shop } = props;
  const { vendor_marketplace_enabled } = useFeatureFlags();
  const available = stock > 0;
  const pricing = getProductPricing(price, props.discountPercent);
  return (
    <section className="product-info-section" aria-label="Product information">
      <div className="pd-eyebrow">COZY CARE / {category || "THE PLANT COLLECTION"}</div>
      <h1 className="product-title">{name}</h1>
      {scientificName && <p className="pd-botanical">{scientificName}</p>}
      <div className="pd-meta">
        {reviewCount > 0 ? <span className="pd-rating"><Star size={15} fill="currentColor" /> <strong>{rating.toFixed(1)}</strong><span>({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span></span> : <span>No reviews yet</span>}
        <span className={`pd-stock ${available ? "" : "is-unavailable"}`}>{available ? "In stock" : "Out of stock"}</span>
      </div>
      <div className="pd-price">{money(price)}<span>per plant</span></div>
      {pricing.discountPercent > 0 && <p><del>{money(pricing.originalPrice)}</del> · {pricing.discountPercent}% OFF</p>}
      {description && <p className="pd-intro">{description.length > 200 ? `${description.slice(0, 197)}…` : description}</p>}
      {vendor_marketplace_enabled && shop && <Link className="pd-seller" to={`/shops/${shop.slug}`}><Store size={15} /> Sold by {shop.name}{shop.is_verified && <ShieldCheck size={16} aria-label="Verified seller" />}</Link>}
      <div className="pd-care-summary">
        {[[Sun, "Light", light], [Droplets, "Water", water], [Sprout, "Care level", difficulty]].map(([Icon, label, value]) => {
          const CareIcon = Icon as typeof Sun;
          return value ? <div key={String(label)}><CareIcon size={20} /><span>{String(label)}<strong>{String(value)}</strong></span></div> : null;
        })}
      </div>
      {size && <div className="pd-size"><span>Plant size</span><strong>{size}</strong><small>Natural shape and growth may vary.</small></div>}
      <div className="pd-purchase" id="purchase">
        <div className="pd-quantity-row"><span>Quantity</span><div className="quantity-selector">
          <button aria-label="Decrease quantity" disabled={busy || quantity <= 1 || !available} onClick={() => setQuantity(quantity - 1)}>−</button>
          <output aria-label="Quantity">{quantity}</output>
          <button aria-label="Increase quantity" disabled={busy || quantity >= stock || !available} onClick={() => setQuantity(quantity + 1)}>+</button>
        </div><strong>{money(price * quantity)}</strong></div>
        <div className="action-buttons">
          <button className="btn-add-cart" disabled={busy || !available} onClick={onAddToCart}><ShoppingBag size={18} />{busy ? "Adding…" : available ? "Add to cart" : "Out of stock"}</button>
          <button className="btn-buy-now" disabled={busy || !available} onClick={onBuyNow}>Buy now <ArrowRight size={17} /></button>
        </div>
        <p className="pd-feedback" role="status" aria-live="polite">{message || "Delivery charges are calculated at checkout."}</p>
      </div>
      <div className="pd-help-links"><Link to="/shipping">Delivery information ↗</Link><Link to="/contact">Ask us about this plant ↗</Link></div>
      <div className="pd-mobile-buy"><div><small>{name}</small><strong>{money(price * quantity)}</strong></div><button disabled={busy || !available} onClick={onAddToCart}>{busy ? "Adding…" : available ? "Add to cart" : "Out of stock"}</button></div>
    </section>
  );
}

