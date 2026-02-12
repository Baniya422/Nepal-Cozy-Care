import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

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
          <Link to="/plant-care" className="footer-link">Plant Care</Link>
          <Link to="/care-tips" className="footer-link">Care Tips</Link>
          <Link to="/watering-guide" className="footer-link">Watering Guide</Link>
          <Link to="/sunlight-guide" className="footer-link">Sunlight Guide</Link>
          <Link to="/plant-health-checker" className="footer-link">Plant Health Checker</Link>
          <Link to="/plant-disease-info" className="footer-link">Plant Disease Info</Link>
          <Link to="/faqs" className="footer-link">FAQs</Link>
          <Link to="/resources" className="footer-resource-link">
            See All Resources →
          </Link>
        </div>

        {/* COMPANY Column */}
        <div className="footer-col">
          <div className="footer-col-title">COMPANY</div>
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/how-it-works" className="footer-link">How it Works</Link>
          <Link to="/mission" className="footer-link">Our Mission</Link>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <Link to="/careers" className="footer-link">Careers</Link>
          <Link to="/blogs" className="footer-link">Blogs</Link>
        </div>

        {/* SUPPORT Column */}
        <div className="footer-col">
          <div className="footer-col-title">SUPPORT</div>
          <Link to="/account" className="footer-link">My Account</Link>
          <Link to="/track-order" className="footer-link">Track Order</Link>
          <Link to="/shipping" className="footer-link">Shipping & Delivery</Link>
          <Link to="/returns" className="footer-link">Return & Refund Policy</Link>
          <Link to="/terms" className="footer-link">Terms & Conditions</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/help" className="footer-link">Help Center</Link>
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
          <Link to="/terms" className="footer-link">Terms & Conditions</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
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
          <Link to="/privacy" className="footer-bottom-link">Privacy</Link>
          <Link to="/terms" className="footer-bottom-link">Terms</Link>
          <Link to="/cookies" className="footer-bottom-link">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

