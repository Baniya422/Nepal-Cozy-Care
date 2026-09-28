import { useState } from "react";
import { Star, ShieldCheck, Heart, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { TestimonialsContent } from "../../features/homepage/storefront";

interface CustomerTestimonialsProps {
  content?: TestimonialsContent;
}

export default function CustomerTestimonials({ content }: CustomerTestimonialsProps) {
  const items = content?.items && content.items.length > 0 ? content.items : [
    {
      name: "Prashant Sharma",
      city: "Baluwatar, Kathmandu",
      rating: 5,
      plant: "Monstera Deliciosa (XL)",
      text: "Arrived in Kathmandu in immaculate condition! Not a single leaf was torn, and the soil was still damp. The care card included is a lifesaver for beginners.",
      date: "2 days ago",
      verified: true,
    },
    {
      name: "Aayusha Shrestha",
      city: "Jhamsikhel, Lalitpur",
      rating: 5,
      plant: "ZZ Plant + Ceramic Pot",
      text: "The ceramic pot finish is top-tier luxury, exactly like high-end international stores. My ZZ plant is thriving on my office desk with zero fuss.",
      date: "1 week ago",
      verified: true,
    },
    {
      name: "Rohan Adhikari",
      city: "Lakeside, Pokhara",
      rating: 5,
      plant: "Fiddle Leaf Fig",
      text: "I was skeptical about plant delivery all the way to Pokhara, but it was packed so securely! Doctor Green answered my lighting questions right away.",
      date: "2 weeks ago",
      verified: true,
    },
    {
      name: "Smriti Thapa",
      city: "Suryabinayak, Bhaktapur",
      rating: 5,
      plant: "Peace Lily Bloom",
      text: "The white blooms were fresh and vibrant. The Plant Health Checker tool is so cool and practical. Will definitely order again!",
      date: "3 weeks ago",
      verified: true,
    },
  ];

  return (
    <section className="sf-testimonials-section" aria-label="Customer Reviews">
      <div className="sf-container">
        {/* Header */}
        <div className="sf-section-header-center">
          <span className="sf-badge-pill">
            <Heart size={14} />
            <span>Real Plant Parents</span>
          </span>
          <h2 className="sf-main-heading">{content?.title || "Loved By 25,000+ Plant Parents"}</h2>
          <p className="sf-sub-heading">
            {content?.subtitle || "Real stories from urban gardeners across Kathmandu, Lalitpur, and Pokhara"}
          </p>
        </div>

        {/* Aggregate Trust Stats Bar */}
        <div className="sf-trust-stats-bar">
          <div className="sf-stat-box">
            <span className="sf-stat-num">25,000+</span>
            <span className="sf-stat-label">Happy Plants Delivered</span>
          </div>
          <div className="sf-stat-divider" />
          <div className="sf-stat-box">
            <span className="sf-stat-num">4.9 / 5.0</span>
            <span className="sf-stat-label">Average Customer Rating</span>
          </div>
          <div className="sf-stat-divider" />
          <div className="sf-stat-box">
            <span className="sf-stat-num">99.4%</span>
            <span className="sf-stat-label">Damage-Free Safe Transit</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="sf-testimonials-grid">
          {items.map((item, idx) => (
            <div key={idx} className="sf-testimonial-card">
              <div className="sf-testimonial-top">
                <div className="sf-stars-row">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <Quote size={20} className="sf-quote-icon" />
              </div>

              <p className="sf-testimonial-quote">"{item.text}"</p>

              <div className="sf-testimonial-author">
                <div className="sf-author-avatar">
                  {item.name.charAt(0)}
                </div>
                <div className="sf-author-meta">
                  <div className="sf-author-name-row">
                    <strong>{item.name}</strong>
                    {item.verified !== false && (
                      <span className="sf-verified-badge" title="Verified Customer">
                        <ShieldCheck size={13} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <span className="sf-author-city">{item.city}</span>
                  {item.plant && (
                    <span className="sf-author-plant">Plant: {item.plant}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
