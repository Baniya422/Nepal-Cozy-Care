import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-line"></div>
      <div className="footer-inner">
        {/* Brand Info */}
        <div className="footer-brand-col">
          <div className="footer-brand">Cozy Care</div>
          <p className="footer-text">
            A smart plant care & e-commerce platform that helps you track watering, get expert tips, and shop plants & accessories.
          </p>
        </div>

        {/* SHOP Column */}
        <div className="footer-col">
          <div className="footer-col-title">SHOP</div>
          <Link to="/care-tips" className="footer-link">Plant Care</Link>
          <Link to="/plants" className="footer-link">Indoor Plants</Link>
          <Link to="/pots" className="footer-link">Pots & Accessories</Link>
          <Link to="/plant-finder" className="footer-link">Plant Finder Quiz</Link>
          
          <div className="footer-col-title" style={{marginTop: '1.5rem'}}>PLANT CARE</div>
          <Link to="/care-tips" className="footer-link">Plant Care Library</Link>
          <Link to="/plant-health-checker" className="footer-link">Plant Health Checker</Link>
          <Link to="/care-tips?category=watering" className="footer-link">Watering Guides</Link>
          <Link to="/help-center" className="footer-link">FAQs</Link>
        </div>

        {/* COMPANY Column */}
        <div className="footer-col">
          <div className="footer-col-title">COMPANY</div>
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/my-garden" className="footer-link">My Garden</Link>
          <Link to="/mission" className="footer-link">Our Mission</Link>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <Link to="/shipping" className="footer-link">Delivery Info</Link>
          <Link to="/blogs" className="footer-link">Blogs</Link>
        </div>

        {/* SUPPORT Column */}
        <div className="footer-col">
          <div className="footer-col-title">SUPPORT</div>
          <Link to="/account" className="footer-link">My Account</Link>
          <Link to="/track-order" className="footer-link">Track Order</Link>
          <Link to="/shipping" className="footer-link">Shipping & Delivery</Link>
          <Link to="/contact" className="footer-link">Contact Support</Link>
          <Link to="/care-tips" className="footer-link">Care Tips</Link>
          <Link to="/help-center" className="footer-link">Help Center</Link>
        </div>

        {/* FOLLOW US & ABOUT Column */}
        <div className="footer-col">
          <div className="footer-col-title">FOLLOW US</div>
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

          <div className="footer-col-title footer-col-title-spacing">ABOUT</div>
          <Link to="/about" className="footer-link">About Cozy Care</Link>
          <Link to="/mission" className="footer-link">Our Mission</Link>
        </div>
      </div>

      {/* Footer Separator */}
      <div className="footer-separator"></div>

      {/* Footer Bottom */}
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

