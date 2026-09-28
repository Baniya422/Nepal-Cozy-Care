import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, Star, ShoppingBag, Eye, ArrowRight, Leaf, X } from "lucide-react";
import type { ShopTheLookContent, HotspotItem } from "../../features/homepage/storefront";
import { resolveHomepageImage } from "../../features/homepage/content";
import { useAddToCart } from "../../hooks/useAddToCart";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface ShopTheLookProps {
  content?: ShopTheLookContent;
}

export default function ShopTheLook({ content }: ShopTheLookProps) {
  const hotspots: HotspotItem[] = content?.hotspots && content.hotspots.length > 0 ? content.hotspots : [
    {
      id: 1,
      x: 52,
      y: 48,
      name: "Monstera Deliciosa (XL)",
      subtitle: "Iconic split-leaf tropical plant",
      price: 1450,
      rating: 4.9,
      image: "/images/mos.jpg",
      path: "/plants/1",
    },
    {
      id: 2,
      x: 32,
      y: 75,
      name: "Minimalist Ceramic Planter",
      subtitle: "Artisanal matte cream pot with saucer",
      price: 750,
      rating: 4.8,
      image: "/images/pot3.webp",
      path: "/pots",
    },
    {
      id: 3,
      x: 72,
      y: 65,
      name: "Golden Brass Watering Can",
      subtitle: "Long-spout precision watering can",
      price: 899,
      rating: 4.9,
      image: "/images/can.jpg",
      path: "/pots?category=watering",
    },
  ];

  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(hotspots[0]?.id || 1);
  const activeItem = activeHotspotId ? (hotspots.find((h) => h.id === activeHotspotId) || null) : null;
  const { cartBusyId, addToCart } = useAddToCart(API);
  const [addedItem, setAddedItem] = useState<number | null>(null);

  const handleAdd = (item: HotspotItem) => {
    addToCart({ id: item.id, name: item.name });
    setAddedItem(item.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const imageSrc = resolveHomepageImage(content?.image || "/images/HomeBackground.png", API);

  return (
    <section className="sf-shop-the-look-section" aria-label="Shop The Look">
      <div className="sf-container">
        {/* Header */}
        <div className="sf-section-header-center">
          <span className="sf-badge-pill">
            <Leaf size={14} />
            <span>Interactive Living Room</span>
          </span>
          <h2 className="sf-main-heading">{content?.title || "Shop The Look: Modern Green Living Room"}</h2>
          <p className="sf-sub-heading">
            {content?.subtitle || "Tap the pulsing hotspots to discover the exact plants and designer planters in this cozy room."}
          </p>
        </div>

        {/* Visual Room with Hotspots */}
        <div className="sf-look-container">
          <div className="sf-look-media">
            <img
              src={imageSrc}
              alt="Styled Green Living Room"
              className="sf-look-image"
              loading="lazy"
            />
            <div className="sf-look-overlay-ambient" />

            {/* Hotspot Markers */}
            {hotspots.map((spot) => {
              const isActive = activeHotspotId === spot.id;
              return (
                <div
                  key={spot.id}
                  className={`sf-hotspot-pin ${isActive ? "active" : ""}`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={() => setActiveHotspotId((prev) => (prev === spot.id ? null : spot.id))}
                  onMouseEnter={() => setActiveHotspotId(spot.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Hotspot for ${spot.name}`}
                >
                  <span className="sf-hotspot-pulse" />
                  <span className="sf-hotspot-core">
                    <Plus size={14} />
                  </span>
                </div>
              );
            })}

            {/* Floating Popover on Image (Active on both Desktop & Mobile) */}
            {activeItem && (
              <div
                className="sf-hotspot-popover"
                style={{
                  left: `clamp(10px, calc(${activeItem.x}% + 18px), calc(100% - 270px))`,
                  top: `clamp(10px, calc(${activeItem.y}% - 35px), calc(100% - 150px))`,
                }}
              >
                <button
                  type="button"
                  className="sf-popover-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(null);
                  }}
                  aria-label="Close product card"
                >
                  <X size={12} />
                </button>
                <div className="sf-popover-thumb">
                  <img
                    src={resolveHomepageImage(activeItem.image, API)}
                    alt={activeItem.name}
                  />
                </div>
                <div className="sf-popover-info">
                  <h4>{activeItem.name}</h4>
                  {activeItem.subtitle && <p className="sf-popover-sub">{activeItem.subtitle}</p>}
                  <div className="sf-popover-pricing">
                    <span className="sf-popover-price">Rs. {activeItem.price.toLocaleString()}</span>
                    {activeItem.rating && (
                      <span className="sf-popover-rating">
                        <Star size={12} fill="#eab308" color="#eab308" />
                        <span>{activeItem.rating}</span>
                      </span>
                    )}
                  </div>
                  <div className="sf-popover-actions">
                    <Link to={activeItem.path} className="sf-popover-btn view">
                      <Eye size={13} />
                      <span>Details</span>
                    </Link>
                    <button
                      type="button"
                      className="sf-popover-btn buy"
                      onClick={() => handleAdd(activeItem)}
                      disabled={cartBusyId === activeItem.id}
                    >
                      {addedItem === activeItem.id ? (
                        <>
                          <Check size={13} />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side / Mobile Product Selector List */}
          <div className="sf-look-sidebar">
            <div className="sf-look-sidebar-header">
              <span className="sf-look-label">Items In This Space ({hotspots.length})</span>
              <span className="sf-look-hint">Tap any item to highlight in room</span>
            </div>

            <div className="sf-look-items-list">
              {hotspots.map((item) => {
                const isSelected = activeHotspotId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`sf-look-item-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setActiveHotspotId(item.id)}
                  >
                    <div className="sf-look-item-thumb">
                      <img
                        src={resolveHomepageImage(item.image, API)}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="sf-look-item-details">
                      <div className="sf-look-item-row">
                        <h5>{item.name}</h5>
                        <span className="sf-look-item-price">Rs. {item.price.toLocaleString()}</span>
                      </div>
                      {item.subtitle && <p className="sf-look-item-sub">{item.subtitle}</p>}
                      <div className="sf-look-item-bottom">
                        <Link
                          to={item.path}
                          className="sf-look-item-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View Product</span>
                          <ArrowRight size={13} />
                        </Link>
                        <button
                          type="button"
                          className="sf-look-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(item);
                          }}
                          disabled={cartBusyId === item.id}
                        >
                          {addedItem === item.id ? (
                            <>
                              <Check size={13} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
