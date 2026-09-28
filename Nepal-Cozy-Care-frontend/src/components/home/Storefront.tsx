import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  Sprout,
  ShieldCheck,
  PackageCheck,
  Stethoscope,
  ScanSearch,
  Compass,
  ChevronRight,
  MessageCircle,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { resolveHomepageImage, type HomepageContent } from '../../features/homepage/content';
import type { HomeTile, SectionKey } from '../../features/homepage/storefront';
import CuratedTabsCollection from './CuratedTabsCollection';
import ShopTheLook from './ShopTheLook';
import WhyChooseUs from './WhyChooseUs';
import CustomerTestimonials from './CustomerTestimonials';
import PopularItems from './PopularItems';
import BestSellers from './BestSellers';
import ShopPlants from './ShopPlants';
import SmartCareTools from './SmartCareTools';
import SeasonalCarePreview from './SeasonalCarePreview';
import './storefront.css';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const imageUrl = (path: string) => resolveHomepageImage(path, API);
const safePath = (path: string) => (/^\/(?!\/)/.test(path) ? path : '/plants');

function CategoryStrip({ title, items }: { title: string; items: HomeTile[] }) {
  if (!items.length) return null;
  return (
    <section className="sf-section sf-categories" aria-label={title}>
      <div className="sf-container">
        <div className="sf-categories-header">
          <div className="sf-categories-title-group">
            <span className="sf-badge-pill">
              <Leaf size={14} />
              <span>Explore The Collection</span>
            </span>
            <h2 className="sf-main-heading">{title}</h2>
          </div>
          <Link to="/plants" className="sf-categories-link desktop-only">
            <span>Browse All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="sf-categories-scroll">
          {items.map((item, index) => (
            <Link className="sf-category-circle-card" to={safePath(item.path)} key={`${item.title}-${index}`}>
              <div className="sf-category-avatar-wrap">
                <img src={imageUrl(item.image)} alt={item.title} loading="lazy" />
                {item.badge && <span className="sf-category-mini-badge">{item.badge}</span>}
              </div>
              <div className="sf-category-info">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tiles({ title, items, kind }: { title: string; items: HomeTile[]; kind: string }) {
  if (!items.length) return null;
  return (
    <section className={`sf-section sf-${kind}`} aria-label={title}>
      <div className="sf-container">
        <div className="sf-heading">
          <div>
            <h2 className="sf-main-heading">{title}</h2>
          </div>
          <span className="sf-heading-leaf">
            <Leaf size={22} />
          </span>
        </div>
        <div className="sf-tile-grid">
          {items.map((item, index) => (
            <Link className="sf-tile" to={safePath(item.path)} key={`${item.title}-${index}`}>
              {item.image && (
                <div className="sf-tile-image">
                  <img src={imageUrl(item.image)} alt={item.title} loading="lazy" />
                  {item.badge && <span className="sf-tile-badge">{item.badge}</span>}
                </div>
              )}
              <div className="sf-tile-copy">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                <span className="sf-text-link">
                  {item.label}
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoomTiles({ title, items }: { title: string; items: HomeTile[] }) {
  if (!items.length) return null;
  return (
    <section className="sf-section sf-rooms" aria-label={title}>
      <div className="sf-container">
        <div className="sf-section-header-center">
          <span className="sf-badge-pill">
            <Leaf size={14} />
            <span>Curated For Every Corner</span>
          </span>
          <h2 className="sf-main-heading">{title}</h2>
          <p className="sf-sub-heading">
            Choose plants that naturally thrive in your room's light levels and lifestyle.
          </p>
        </div>
        <div className="sf-tile-grid">
          {items.map((item, index) => (
            <Link className="sf-room-card" to={safePath(item.path)} key={`${item.title}-${index}`}>
              <div className="sf-room-image-wrap">
                <img src={imageUrl(item.image)} alt={item.title} loading="lazy" />
                <div className="sf-room-gradient-scrim" />
              </div>
              <div className="sf-room-copy">
                <span className="sf-room-kicker">{item.description || 'Curated Space'}</span>
                <h3>{item.title}</h3>
                <span className="sf-room-explore-pill">
                  {item.label || 'Shop Room'}
                  <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DoctorGreenBanner() {
  return (
    <section className="sf-doctor-green-banner" aria-label="Plant Doctor Consultation">
      <div className="sf-container sf-doctor-container">
        <div className="sf-doctor-content">
          <span className="sf-badge-pill light">
            <Stethoscope size={14} />
            <span>Certified Plant Doctors</span>
          </span>
          <h2>Got Plant Problems? We're Here to Help.</h2>
          <p>
            Whether your leaves are turning yellow, curling, or dropping, our certified Kathmandu horticulturists
            diagnose issues for free on WhatsApp.
          </p>
          <div className="sf-doctor-actions">
            <a
              href="https://wa.me/9779800000000?text=Hi%20Nepal%20Cozy%20Care%2C%20I%20need%20help%20with%20my%20plant!"
              target="_blank"
              rel="noopener noreferrer"
              className="sf-doctor-btn whatsapp"
            >
              <MessageCircle size={18} />
              <span>Chat with Plant Doctor</span>
            </a>
            <Link to="/plant-health-checker" className="sf-doctor-btn scanner">
              <ScanSearch size={18} />
              <span>Plant Health Scanner</span>
            </Link>
          </div>
        </div>
        <div className="sf-doctor-decor">
          <div className="sf-doctor-avatar-circle">
            <Stethoscope size={48} />
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterClub() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="sf-newsletter-section" aria-label="Join Cozy Green Club">
      <div className="sf-container sf-newsletter-inner">
        <div className="sf-newsletter-copy">
          <span className="sf-badge-pill">
            <Sprout size={14} />
            <span>Join The Cozy Green Club</span>
          </span>
          <h2>Get 10% Off Your First Order</h2>
          <p>
            Plus weekly seasonal watering reminders, plant repotting guides, and exclusive first access to rare nursery drops.
          </p>
        </div>

        <div className="sf-newsletter-form-wrap">
          {subscribed ? (
            <div className="sf-subscribed-notice">
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <strong>You're in the club!</strong>
                <p>Use code <strong>GREEN10</strong> at checkout for 10% off your purchase.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sf-newsletter-form">
              <div className="sf-newsletter-input-box">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="sf-newsletter-submit">
                <span>Claim 10% Off</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Storefront({ content }: { content: HomepageContent }) {
  const { storefront: shop, hero } = content;

  const renderSection = (id: SectionKey) => {
    switch (id) {
      case 'categories':
        return <CategoryStrip {...shop.categories} />;
      case 'tabs_collection':
        return <CuratedTabsCollection content={shop.tabs_collection} />;
      case 'offers':
        return <Tiles {...shop.offers} kind="offers" />;
      case 'shop_the_look':
        return <ShopTheLook content={shop.shop_the_look} />;
      case 'rooms':
        return <RoomTiles {...shop.rooms} />;
      case 'why_us':
        return <WhyChooseUs content={shop.why_us} />;
      case 'testimonials':
        return <CustomerTestimonials content={shop.testimonials} />;
      case 'journey':
        return <Tiles {...shop.journey} kind="journey" />;
      case 'journal':
        return <Tiles {...shop.journal} kind="journal" />;
      case 'popular':
        return <PopularItems content={content.product_sections.popular} />;
      case 'best_sellers':
        return <BestSellers content={content.product_sections.best_sellers} />;
      case 'shop':
        return <ShopPlants content={content.product_sections.shop} />;
      case 'smart_tools':
        return <SmartCareTools content={content.smart_tools} />;
      case 'seasonal':
        return <SeasonalCarePreview content={content.seasonal} />;
      case 'garden':
      case 'mission': {
        const info = content[id];
        return (
          <section className={`sf-section sf-story sf-story-${id}`}>
            <div className="sf-container sf-story-grid">
              <div className="sf-story-media">
                <img src={imageUrl(info.image)} alt={info.image_alt} loading="lazy" />
              </div>
              <div className="sf-story-copy">
                <span className="sf-badge-pill">
                  <Leaf size={14} />
                  <span>Nepal Cozy Care</span>
                </span>
                <h2>{info.title}</h2>
                <p>{info.description}</p>
                <Link className="sf-button" to={safePath(info.button_path)}>
                  <span>{info.button_label}</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        );
      }
      case 'about':
        return (
          <section className="sf-section sf-about">
            <div className="sf-container">
              <Sprout size={40} className="sf-about-icon" />
              <h2>{content.about.title}</h2>
              <p>{content.about.description}</p>
              <Link className="sf-text-link" to={safePath(content.about.button_path)}>
                <span>{content.about.button_label}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        );
      case 'faq':
        return (
          <section className="sf-section sf-faq">
            <div className="sf-container sf-faq-grid">
              <div className="sf-faq-sidebar">
                <span className="sf-badge-pill">
                  <Leaf size={14} />
                  <span>Help & Clarity</span>
                </span>
                <h2>{shop.faq.title}</h2>
                <p>Everything you need to know about delivery, plant health, and unboxing.</p>
                <Link className="sf-text-link" to="/help-center">
                  <span>Visit our Help Center</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="sf-faq-accordion">
                {shop.faq.items.map((item, index) => (
                  <details key={index} className="sf-faq-item">
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="cozy-storefront">
      {/* Hero Section */}
      <section className="sf-hero">
        <div className="sf-hero-copy">
          <span className="sf-eyebrow">
            <span className="sf-pulse-dot" />
            {hero.badge}
          </span>
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>

          <div className="sf-hero-actions">
            <Link className="sf-button primary" to={safePath(hero.primary_cta.path)}>
              <span>{hero.primary_cta.label}</span>
              <ArrowRight size={18} />
            </Link>
            <Link className="sf-hero-quiz-btn" to={safePath(hero.secondary_cta.path)}>
              <Compass size={16} />
              <span>{hero.secondary_cta.label}</span>
            </Link>
          </div>

          <div className="sf-hero-highlights">
            {hero.highlights.map((item, i) => (
              <span key={i} className="sf-highlight-tag">
                <Sprout size={14} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="sf-hero-photo">
          <img
            src={imageUrl(hero.background_image)}
            alt="Healthy indoor plants bringing vitality into a cozy living room"
            fetchPriority="high"
          />
          <div className="sf-photo-overlay-gradient" />
          <div className="sf-photo-note">
            <Leaf size={22} />
            <span>
              A little nature.<br />
              <strong>A lot of joy.</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <div className="sf-benefits">
        <div className="sf-container sf-benefits-grid">
          {content.features.map((feature, i) => (
            <div key={i} className="sf-benefit-card">
              <div className="sf-benefit-icon">
                {i === 0 ? <PackageCheck size={22} /> : i === 1 ? <Stethoscope size={22} /> : <ShieldCheck size={22} />}
              </div>
              <div>
                <strong>{feature.title}</strong>
                <small>{feature.description}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render Configured Dynamic Sections */}
      {shop.sections
        .filter((section) => section.enabled)
        .map((section) => (
          <div key={section.id} id={`home-${section.id}`}>
            {renderSection(section.id)}
          </div>
        ))}

      {/* Doctor Green Floating Assistance Banner */}
      <DoctorGreenBanner />

      {/* Cozy Green Club Newsletter */}
      <NewsletterClub />
    </div>
  );
}
