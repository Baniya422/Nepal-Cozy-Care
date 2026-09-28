import { useId, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Trash2, Eye, MapPin } from 'lucide-react';
import type { HomepageContent } from '../../features/homepage/content';
import {
  type HomeTile,
  type StorefrontContent,
  type HotspotItem,
  type TestimonialItem,
  type WhyUsItem,
} from '../../features/homepage/storefront';
import Storefront from '../home/Storefront';
import '../home/home.css';
import './storefront-editor.css';

function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = useId();
  return (
    <div className="admin-form-group">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="admin-form-group">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const labels: Record<string, string> = {
  categories: 'Shop by Category (Circular Icons)',
  tabs_collection: 'Curated Tabs Collection (Best Sellers, Air Purifying, etc.)',
  offers: 'Promotional Duo Banners',
  shop_the_look: 'Shop The Look (Interactive Room Hotspots)',
  rooms: 'Shop by Space / Room',
  best_sellers: 'Bestsellers Carousel',
  popular: 'Popular Products Carousel',
  why_us: 'The Cozy Care Promise (Guarantees & Pillars)',
  journey: 'Plant Parenting Journey',
  shop: 'Shop Plants Catalog',
  smart_tools: 'Doctor Green & Smart Care Tools',
  seasonal: 'Seasonal Care Advice',
  garden: 'Greenhouse Story',
  testimonials: 'Customer Reviews & Real Stories',
  journal: 'Green Journal & Guides',
  mission: 'Our Mission Story',
  about: 'About The Brand',
  faq: 'Frequently Asked Questions',
};

type TileKey = 'categories' | 'offers' | 'rooms' | 'journey' | 'journal';
const tileKeys: TileKey[] = ['categories', 'offers', 'rooms', 'journey', 'journal'];

export default function StorefrontEditor({
  content,
  onChange,
  ImageField,
}: {
  content: HomepageContent;
  onChange: (content: HomepageContent) => void;
  ImageField: ComponentType<{ label: string; value: string; onChange: (value: string) => void }>;
}) {
  const [preview, setPreview] = useState(false);
  const [mobile, setMobile] = useState(false);
  const shop = content.storefront;

  const update = (patch: Partial<StorefrontContent>) =>
    onChange({ ...content, storefront: { ...shop, ...patch } });

  const move = (index: number, offset: number) => {
    const sections = [...shop.sections];
    [sections[index], sections[index + offset]] = [sections[index + offset], sections[index]];
    update({ sections });
  };

  const updateTile = (key: TileKey, index: number, field: keyof HomeTile, value: string) =>
    update({
      [key]: {
        ...shop[key],
        items: shop[key].items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      },
    });

  // Hotspot Helpers
  const updateHotspot = (index: number, field: keyof HotspotItem, value: any) => {
    const updated = shop.shop_the_look.hotspots.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    update({ shop_the_look: { ...shop.shop_the_look, hotspots: updated } });
  };

  const addHotspot = () => {
    const newId = Date.now();
    const newSpot: HotspotItem = {
      id: newId,
      x: 50,
      y: 50,
      name: 'New Featured Plant',
      subtitle: 'Healthy indoor greenery',
      price: 1200,
      rating: 4.9,
      image: '/images/mos.jpg',
      path: '/plants',
    };
    update({
      shop_the_look: {
        ...shop.shop_the_look,
        hotspots: [...(shop.shop_the_look.hotspots || []), newSpot],
      },
    });
  };

  const removeHotspot = (index: number) => {
    update({
      shop_the_look: {
        ...shop.shop_the_look,
        hotspots: shop.shop_the_look.hotspots.filter((_, i) => i !== index),
      },
    });
  };

  // Why Us Helpers
  const updateWhyUsItem = (index: number, field: keyof WhyUsItem, value: string) => {
    const updated = shop.why_us.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    update({ why_us: { ...shop.why_us, items: updated } });
  };

  // Testimonials Helpers
  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: any) => {
    const updated = shop.testimonials.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    update({ testimonials: { ...shop.testimonials, items: updated } });
  };

  const addTestimonial = () => {
    const newReview: TestimonialItem = {
      name: 'Plant Parent',
      city: 'Kathmandu',
      rating: 5,
      plant: 'Monstera Deliciosa',
      text: 'Super fast delivery and packaged securely. My plant is thriving!',
      date: 'Just now',
      verified: true,
    };
    update({
      testimonials: {
        ...shop.testimonials,
        items: [...(shop.testimonials.items || []), newReview],
      },
    });
  };

  const removeTestimonial = (index: number) => {
    update({
      testimonials: {
        ...shop.testimonials,
        items: shop.testimonials.items.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <section id="sec-storefront" className="admin-editor-card sf-editor">
      <div className="admin-editor-card-head">
        <h3>Storefront Designer (Ugaoo-Inspired Layout)</h3>
        <p>
          Configure the announcement ribbon, section ordering, category bubbles, interactive hotspots,
          guarantee pillars, and reviews. Click "Save changes" at the top when done.
        </p>
      </div>

      <div className="sf-editor-links">
        <Link to="/admin/pages/navigation">Navigation menus ↗</Link>
        <Link to="/admin/pages/branding">Logo & branding ↗</Link>
        <Link to="/admin/plants">Manage Products ↗</Link>
      </div>

      {/* Top Announcement Bar */}
      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#164e63' }}>Top Announcement Strip</h4>
      <div className="admin-form-grid">
        <TextField
          label="Announcement text"
          value={shop.announcement}
          onChange={(announcement) => update({ announcement })}
        />
        <TextField
          label="Announcement link (starts with /)"
          value={shop.announcement_path}
          onChange={(announcement_path) => update({ announcement_path })}
        />
      </div>

      {/* Section Order & Visibility */}
      <h4>Section Order & Visibility</h4>
      <p className="sf-editor-hint">
        Reorder sections or uncheck to instantly hide any section on the public homepage.
      </p>
      <div className="sf-editor-order">
        {shop.sections.map((section, index) => (
          <div key={section.id}>
            <label>
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(e) =>
                  update({
                    sections: shop.sections.map((item, i) =>
                      i === index ? { ...item, enabled: e.target.checked } : item
                    ),
                  })
                }
              />
              {labels[section.id] || section.id}
            </label>
            <span>
              <button
                type="button"
                disabled={index === 0}
                aria-label={`Move ${labels[section.id] || section.id} up`}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                disabled={index === shop.sections.length - 1}
                aria-label={`Move ${labels[section.id] || section.id} down`}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} />
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* 1. Curated Tabs Collection Editor */}
      <details className="sf-editor-group">
        <summary>
          🌟 Curated Tabs Collection (Best Sellers, Air Purifying, Low Light, Pots)
        </summary>
        <div style={{ marginTop: '1rem' }}>
          <div className="admin-form-grid">
            <TextField
              label="Section title"
              value={shop.tabs_collection?.title || "Nepal's Favorite Greenery"}
              onChange={(title) =>
                update({ tabs_collection: { ...shop.tabs_collection, title } })
              }
            />
            <TextField
              label="Section subtitle"
              value={shop.tabs_collection?.subtitle || ''}
              onChange={(subtitle) =>
                update({ tabs_collection: { ...shop.tabs_collection, subtitle } })
              }
            />
          </div>
        </div>
      </details>

      {/* 2. Shop The Look / Hotspots Editor */}
      <details className="sf-editor-group">
        <summary>
          🏡 Shop The Look (Interactive Room Hotspots) <span>{shop.shop_the_look?.hotspots?.length || 0} hotspots</span>
        </summary>
        <div style={{ marginTop: '1rem' }}>
          <div className="admin-form-grid">
            <TextField
              label="Section title"
              value={shop.shop_the_look?.title || ''}
              onChange={(title) => update({ shop_the_look: { ...shop.shop_the_look, title } })}
            />
            <TextField
              label="Section subtitle"
              value={shop.shop_the_look?.subtitle || ''}
              onChange={(subtitle) =>
                update({ shop_the_look: { ...shop.shop_the_look, subtitle } })
              }
            />
          </div>

          <ImageField
            label="Room background photo"
            value={shop.shop_the_look?.image || '/images/HomeBackground.png'}
            onChange={(image) => update({ shop_the_look: { ...shop.shop_the_look, image } })}
          />

          <h5 style={{ margin: '1.25rem 0 0.5rem', color: '#0c4a34' }}>Interactive Hotspots:</h5>
          {(shop.shop_the_look?.hotspots || []).map((spot, index) => (
            <div className="sf-editor-tile" key={spot.id || index}>
              <div className="sf-editor-tile-head">
                <strong>
                  <MapPin size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Hotspot #{index + 1}: {spot.name}
                </strong>
                <button
                  type="button"
                  aria-label={`Remove hotspot ${index + 1}`}
                  onClick={() => removeHotspot(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="admin-form-grid">
                <TextField
                  label="X Position (0% left to 100% right)"
                  type="number"
                  value={spot.x}
                  onChange={(v) => updateHotspot(index, 'x', Number(v))}
                />
                <TextField
                  label="Y Position (0% top to 100% bottom)"
                  type="number"
                  value={spot.y}
                  onChange={(v) => updateHotspot(index, 'y', Number(v))}
                />
                <TextField
                  label="Product name"
                  value={spot.name}
                  onChange={(v) => updateHotspot(index, 'name', v)}
                />
                <TextField
                  label="Subtitle / description"
                  value={spot.subtitle || ''}
                  onChange={(v) => updateHotspot(index, 'subtitle', v)}
                />
                <TextField
                  label="Price in Rs."
                  type="number"
                  value={spot.price}
                  onChange={(v) => updateHotspot(index, 'price', Number(v))}
                />
                <TextField
                  label="Product link (/plants/1, etc.)"
                  value={spot.path}
                  onChange={(v) => updateHotspot(index, 'path', v)}
                />
              </div>

              <ImageField
                label="Product thumbnail"
                value={spot.image}
                onChange={(img) => updateHotspot(index, 'image', img)}
              />
            </div>
          ))}

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={addHotspot}
            style={{ marginTop: '0.75rem' }}
          >
            <Plus size={16} /> Add Hotspot Pin
          </button>
        </div>
      </details>

      {/* 3. Why Choose Us / Guarantees Editor */}
      <details className="sf-editor-group">
        <summary>
          🛡️ The Cozy Care Promise (4 Guarantee Pillars)
        </summary>
        <div style={{ marginTop: '1rem' }}>
          <div className="admin-form-grid">
            <TextField
              label="Section title"
              value={shop.why_us?.title || ''}
              onChange={(title) => update({ why_us: { ...shop.why_us, title } })}
            />
            <TextField
              label="Section subtitle"
              value={shop.why_us?.subtitle || ''}
              onChange={(subtitle) => update({ why_us: { ...shop.why_us, subtitle } })}
            />
          </div>

          {(shop.why_us?.items || []).map((item, index) => (
            <div className="sf-editor-tile" key={index}>
              <strong>Pillar #{index + 1}</strong>
              <div className="admin-form-grid" style={{ marginTop: '0.5rem' }}>
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateWhyUsItem(index, 'title', v)}
                />
                <TextField
                  label="Icon name (PackageCheck, ShieldCheck, Sprout, Stethoscope, Truck)"
                  value={item.icon}
                  onChange={(v) => updateWhyUsItem(index, 'icon', v)}
                />
              </div>
              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(v) => updateWhyUsItem(index, 'description', v)}
              />
            </div>
          ))}
        </div>
      </details>

      {/* 4. Customer Testimonials & Reviews Editor */}
      <details className="sf-editor-group">
        <summary>
          💬 Customer Reviews & Real Stories <span>{shop.testimonials?.items?.length || 0} reviews</span>
        </summary>
        <div style={{ marginTop: '1rem' }}>
          <div className="admin-form-grid">
            <TextField
              label="Section title"
              value={shop.testimonials?.title || ''}
              onChange={(title) => update({ testimonials: { ...shop.testimonials, title } })}
            />
            <TextField
              label="Section subtitle"
              value={shop.testimonials?.subtitle || ''}
              onChange={(subtitle) => update({ testimonials: { ...shop.testimonials, subtitle } })}
            />
          </div>

          {(shop.testimonials?.items || []).map((review, index) => (
            <div className="sf-editor-tile" key={index}>
              <div className="sf-editor-tile-head">
                <strong>Review #{index + 1}: {review.name} ({review.city})</strong>
                <button
                  type="button"
                  aria-label={`Remove review ${index + 1}`}
                  onClick={() => removeTestimonial(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="admin-form-grid">
                <TextField
                  label="Customer name"
                  value={review.name}
                  onChange={(v) => updateTestimonial(index, 'name', v)}
                />
                <TextField
                  label="City / Location"
                  value={review.city}
                  onChange={(v) => updateTestimonial(index, 'city', v)}
                />
                <TextField
                  label="Plant purchased"
                  value={review.plant}
                  onChange={(v) => updateTestimonial(index, 'plant', v)}
                />
                <TextField
                  label="Star rating (1 to 5)"
                  type="number"
                  value={review.rating}
                  onChange={(v) => updateTestimonial(index, 'rating', Number(v))}
                />
              </div>

              <TextAreaField
                label="Review text"
                value={review.text}
                onChange={(v) => updateTestimonial(index, 'text', v)}
              />
            </div>
          ))}

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={addTestimonial}
            style={{ marginTop: '0.75rem' }}
          >
            <Plus size={16} /> Add Customer Review
          </button>
        </div>
      </details>

      {/* 5. Tile Groups (Categories, Offers, Rooms, Journey, Journal) */}
      {tileKeys.map((key) => (
        <details key={key} className="sf-editor-group">
          <summary>
            {labels[key] || key} <span>{shop[key]?.items?.length || 0} cards</span>
          </summary>
          <div style={{ marginTop: '1rem' }}>
            <TextField
              label="Section heading"
              value={shop[key]?.title || ''}
              onChange={(title) => update({ [key]: { ...shop[key], title } })}
            />
            {(shop[key]?.items || []).map((item, index) => (
              <div className="sf-editor-tile" key={index}>
                <div className="sf-editor-tile-head">
                  <strong>Card {index + 1}: {item.title}</strong>
                  <span>
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label={`Move card ${index + 1} up`}
                      onClick={() => {
                        const items = [...shop[key].items];
                        [items[index - 1], items[index]] = [items[index], items[index - 1]];
                        update({ [key]: { ...shop[key], items } });
                      }}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove card ${index + 1}`}
                      onClick={() =>
                        update({
                          [key]: {
                            ...shop[key],
                            items: shop[key].items.filter((_, i) => i !== index),
                          },
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
                <ImageField
                  label="Card image"
                  value={item.image}
                  onChange={(value) => updateTile(key, index, 'image', value)}
                />
                <div className="admin-form-grid">
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(value) => updateTile(key, index, 'title', value)}
                  />
                  <TextField
                    label="Description / subtitle"
                    value={item.description}
                    onChange={(value) => updateTile(key, index, 'description', value)}
                  />
                  <TextField
                    label="Badge tag (e.g. Popular, Trending)"
                    value={item.badge || ''}
                    onChange={(value) => updateTile(key, index, 'badge', value)}
                  />
                  <TextField
                    label="Link (starts with /)"
                    value={item.path}
                    onChange={(value) => updateTile(key, index, 'path', value)}
                  />
                  <TextField
                    label="Button label"
                    value={item.label}
                    onChange={(value) => updateTile(key, index, 'label', value)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              disabled={(shop[key]?.items?.length || 0) >= 16}
              onClick={() =>
                update({
                  [key]: {
                    ...shop[key],
                    items: [
                      ...(shop[key]?.items || []),
                      {
                        title: 'New Card',
                        description: '',
                        image: '/images/categories/plants.webp',
                        path: '/plants',
                        label: 'Explore',
                      },
                    ],
                  },
                })
              }
            >
              <Plus size={16} /> Add Card
            </button>
          </div>
        </details>
      ))}

      {/* 6. FAQ Editor */}
      <details className="sf-editor-group">
        <summary>Frequently Asked Questions ({shop.faq?.items?.length || 0})</summary>
        <div style={{ marginTop: '1rem' }}>
          <TextField
            label="Section heading"
            value={shop.faq?.title || ''}
            onChange={(title) => update({ faq: { ...shop.faq, title } })}
          />
          {(shop.faq?.items || []).map((item, index) => (
            <div key={index} className="sf-editor-tile">
              <TextField
                label={`Question ${index + 1}`}
                value={item.question}
                onChange={(question) =>
                  update({
                    faq: {
                      ...shop.faq,
                      items: shop.faq.items.map((row, i) =>
                        i === index ? { ...row, question } : row
                      ),
                    },
                  })
                }
              />
              <TextAreaField
                label="Answer"
                value={item.answer}
                onChange={(answer) =>
                  update({
                    faq: {
                      ...shop.faq,
                      items: shop.faq.items.map((row, i) =>
                        i === index ? { ...row, answer } : row
                      ),
                    },
                  })
                }
              />
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() =>
                  update({
                    faq: {
                      ...shop.faq,
                      items: shop.faq.items.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                <Trash2 size={15} /> Remove Question
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={(shop.faq?.items?.length || 0) >= 16}
            onClick={() =>
              update({
                faq: {
                  ...shop.faq,
                  items: [
                    ...(shop.faq?.items || []),
                    { question: 'New Question', answer: 'Add your answer here.' },
                  ],
                },
              })
            }
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </details>

      {/* Live Preview Button */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => setPreview(!preview)}
        >
          <Eye size={16} />
          {preview ? 'Hide Preview' : 'Preview Unsaved Changes'}
        </button>
        {preview && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={mobile}
              onChange={(e) => setMobile(e.target.checked)}
            />
            Mobile screen width
          </label>
        )}
      </div>

      {preview && (
        <div className="sf-editor-preview" style={{ marginTop: '1.5rem' }}>
          <p className="sf-editor-hint">
            Live preview of your storefront. Links and shopping actions are in preview mode.
          </p>
          <div className="sf-preview-scroll">
            <div style={{ width: mobile ? 390 : '100%', maxWidth: '1240px', margin: '0 auto' }} inert>
              <Storefront content={content} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
