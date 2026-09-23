import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, ChevronDown } from "lucide-react";
import { useSiteBranding } from "../../context/BrandingContext";
import "./footer.css";

export default function Footer() {
  const { branding } = useSiteBranding();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer className="footer">
      <div className="footer-top-line"></div>
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand">{branding.site_name}</div>
          <p className="footer-text">
            {branding.footer_description}
          </p>
        </div>

        {/* Shop Column */}
        <div className="footer-col">
          <div className="footer-accordion-item">
            <button
              type="button"
              className="footer-accordion-btn"
              onClick={() => toggleSection("shop")}
              aria-expanded={!!openSections["shop"]}
            >
              <span className="footer-col-title">SHOP</span>
              <ChevronDown
                size={18}
                className={`footer-chevron ${openSections["shop"] ? "rotate" : ""}`}
              />
            </button>
            <div className={`footer-accordion-content ${openSections["shop"] ? "open" : ""}`}>
              <Link to="/care-tips" className="footer-link">Plant Care</Link>
              <Link to="/plants" className="footer-link">Indoor Plants</Link>
              <Link to="/pots" className="footer-link">Pots & Accessories</Link>
              <Link to="/plant-finder" className="footer-link">Plant Finder Quiz</Link>
            </div>
          </div>

          <div className="footer-accordion-item footer-col-title-spacing">
            <button
              type="button"
              className="footer-accordion-btn"
              onClick={() => toggleSection("plant-care")}
              aria-expanded={!!openSections["plant-care"]}
            >
              <span className="footer-col-title">PLANT CARE</span>
              <ChevronDown
                size={18}
                className={`footer-chevron ${openSections["plant-care"] ? "rotate" : ""}`}
              />
            </button>
            <div className={`footer-accordion-content ${openSections["plant-care"] ? "open" : ""}`}>
              <Link to="/care-tips" className="footer-link">Plant Care Library</Link>
              <Link to="/plant-health-checker" className="footer-link">Plant Health Checker</Link>
              <Link to="/care-tips?category=watering" className="footer-link">Watering Guides</Link>
              <Link to="/help-center" className="footer-link">FAQs</Link>
            </div>
          </div>
        </div>

        {/* Company Column */}
        <div className="footer-col">
          <div className="footer-accordion-item">
            <button
              type="button"
              className="footer-accordion-btn"
              onClick={() => toggleSection("company")}
              aria-expanded={!!openSections["company"]}
            >
              <span className="footer-col-title">COMPANY</span>
              <ChevronDown
                size={18}
                className={`footer-chevron ${openSections["company"] ? "rotate" : ""}`}
              />
            </button>
            <div className={`footer-accordion-content ${openSections["company"] ? "open" : ""}`}>
              <Link to="/about" className="footer-link">About Us</Link>
              <Link to="/my-garden" className="footer-link">My Garden</Link>
              <Link to="/mission" className="footer-link">Our Mission</Link>
              <Link to="/contact" className="footer-link">Contact Us</Link>
              <Link to="/shipping" className="footer-link">Delivery Info</Link>
              <Link to="/blogs" className="footer-link">Blogs</Link>
            </div>
          </div>
        </div>

        {/* Support Column */}
        <div className="footer-col">
          <div className="footer-accordion-item">
            <button
              type="button"
              className="footer-accordion-btn"
              onClick={() => toggleSection("support")}
              aria-expanded={!!openSections["support"]}
            >
              <span className="footer-col-title">SUPPORT</span>
              <ChevronDown
                size={18}
                className={`footer-chevron ${openSections["support"] ? "rotate" : ""}`}
              />
            </button>
            <div className={`footer-accordion-content ${openSections["support"] ? "open" : ""}`}>
              <Link to="/account" className="footer-link">My Account</Link>
              <Link to="/track-order" className="footer-link">Track Order</Link>
              <Link to="/shipping" className="footer-link">Shipping & Delivery</Link>
              <Link to="/contact" className="footer-link">Contact Support</Link>
              <Link to="/care-tips" className="footer-link">Care Tips</Link>
              <Link to="/help-center" className="footer-link">Help Center</Link>
            </div>
          </div>
        </div>

        {/* Follow Us Column */}
        <div className="footer-col">
          <div className="footer-accordion-item">
            <button
              type="button"
              className="footer-accordion-btn"
              onClick={() => toggleSection("follow-us")}
              aria-expanded={!!openSections["follow-us"]}
            >
              <span className="footer-col-title">FOLLOW US</span>
              <ChevronDown
                size={18}
                className={`footer-chevron ${openSections["follow-us"] ? "rotate" : ""}`}
              />
            </button>
            <div className={`footer-accordion-content ${openSections["follow-us"] ? "open" : ""}`}>
              <div className="footer-social-links">
                <Link to="https://facebook.com" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <Facebook size={18} />
                  <span>Facebook</span>
                </Link>
                <Link to="https://instagram.com" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <Instagram size={18} />
                  <span>Instagram</span>
                </Link>
                <Link to="https://youtube.com" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <Youtube size={18} />
                  <span>Youtube</span>
                </Link>
                <Link to="https://tiktok.com" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <span className="footer-tiktok-icon">♪</span>
                  <span>Tik Tok</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="footer-accordion-item footer-col-title-spacing">
            <button
              type="button"
              className="footer-accordion-btn"
              onClick={() => toggleSection("about-extra")}
              aria-expanded={!!openSections["about-extra"]}
            >
              <span className="footer-col-title">ABOUT</span>
              <ChevronDown
                size={18}
                className={`footer-chevron ${openSections["about-extra"] ? "rotate" : ""}`}
              />
            </button>
            <div className={`footer-accordion-content ${openSections["about-extra"] ? "open" : ""}`}>
              <Link to="/about" className="footer-link">About Cozy Care</Link>
              <Link to="/mission" className="footer-link">Our Mission</Link>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="footer-separator"></div>
      {}
      <div className="footer-bottom">
        <div className="footer-copyright">
          © {new Date().getFullYear()} Cozy Care. All rights reserved.
        </div>
        <div className="footer-bottom-links">
          <Link to="/contact" className="footer-bottom-link">Contact</Link>
          <Link to="/help-center" className="footer-bottom-link">Help</Link>
          <Link to="/my-garden" className="footer-bottom-link">My Garden</Link>
        </div>
      </div>
    </footer>
  );
}
