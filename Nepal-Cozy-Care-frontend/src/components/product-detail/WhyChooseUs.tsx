import { Link } from "react-router-dom";
import { Truck, MessageCircle, Leaf, BookOpen } from "lucide-react";
export default function WhyChooseUs() {
  return <section className="why-choose-section"><h3>A little care, beyond the pot.</h3><div className="features-grid">
    <Link className="feature" to="/shipping"><Truck size={24}/><span>Delivery information</span></Link>
    <Link className="feature" to="/contact"><MessageCircle size={24}/><span>Here for your questions</span></Link>
    <Link className="feature" to="/my-garden"><Leaf size={24}/><span>Your personal plant collection</span></Link>
    <Link className="feature" to="/care-tips"><BookOpen size={24}/><span>Guides for growing together</span></Link>
  </div></section>;
}
