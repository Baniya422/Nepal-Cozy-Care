import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
  Package,
  MessageSquare,
  Phone,
  Mail,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/help-center.css";

type HelpCategory = "all" | "orders" | "returns" | "payments" | "account";

type FAQItem = {
  id: number;
  category: Exclude<HelpCategory, "all">;
  question: string;
  answer: string;
};

const helpCategories: { key: HelpCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders & Shipping" },
  { key: "returns", label: "Returns & Refunds" },
  { key: "payments", label: "Payments" },
  { key: "account", label: "Account" },
];

const faqItems: FAQItem[] = [
  {
    id: 1,
    category: "orders",
    question: "How can I track my order?",
    answer:
      "Go to Track Order page, enter your order ID and email, and you will see live status updates including packed, shipped, and delivered states.",
  },
  {
    id: 2,
    category: "orders",
    question: "How long does delivery usually take?",
    answer:
      "Inside Kathmandu Valley, delivery usually takes 1-3 business days. Outside valley may take 3-6 business days based on courier coverage.",
  },
  {
    id: 3,
    category: "returns",
    question: "What if my plant arrives damaged?",
    answer:
      "Please contact support within 24 hours with order ID and clear photos. Our team will verify and arrange replacement or refund based on policy.",
  },
  {
    id: 4,
    category: "returns",
    question: "When will I receive my refund?",
    answer:
      "Approved refunds are processed within 3-7 business days. Actual credit timing may depend on your payment provider.",
  },
  {
    id: 5,
    category: "payments",
    question: "Which payment methods are accepted?",
    answer:
      "We currently support Cash on Delivery and online payments configured on your checkout flow. New payment gateways can be added progressively.",
  },
  {
    id: 6,
    category: "payments",
    question: "Why did my payment fail?",
    answer:
      "Payment can fail due to bank decline, network timeout, or insufficient funds. Retry once and contact support if the issue repeats.",
  },
  {
    id: 7,
    category: "account",
    question: "Do I need an account to place an order?",
    answer:
      "Yes, login is required for cart, checkout, and order history. This helps us secure your data and keep order tracking accurate.",
  },
  {
    id: 8,
    category: "account",
    question: "How can I update my phone number or address?",
    answer:
      "You can update shipping details during checkout. For account-level profile updates, contact support and we will assist immediately.",
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<HelpCategory>("all");
  const [openFAQ, setOpenFAQ] = useState<number | null>(1);

  // Client-side filtered FAQ list by category and search query
  const filteredFAQs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" ? true : item.category === activeCategory;

      const matchesSearch =
        query.length === 0
          ? true
          : item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  const toggleFAQ = (id: number) => {
    setOpenFAQ((prev) => (prev === id ? null : id));
  };

  return (
    <Layout>
      <div className="help-center-page">
        {/* Hero/Header Section */}
        <section className="help-center-hero">
          <div className="help-center-hero-inner">
            <h1 className="help-center-title">Help Center</h1>
            <p className="help-center-subtitle">
              Find answers about orders, shipping, returns, payments, and account support.
            </p>
          </div>
        </section>

        <section className="help-center-content">
          <div className="help-center-container">
            {/* Search Box */}
            <div className="help-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Chips/Tabs */}
            <div className="help-category-chips">
              {helpCategories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  className={`help-chip ${
                    activeCategory === category.key ? "help-chip-active" : ""
                  }`}
                  onClick={() => setActiveCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* FAQ Section with Accordion */}
            <section className="help-faq-section">
              <div className="help-section-head">
                <MessageSquare size={18} />
                <h2>Frequently Asked Questions</h2>
              </div>

              {filteredFAQs.length === 0 ? (
                <div className="help-empty">No FAQ items match your search.</div>
              ) : (
                <div className="help-faq-list">
                  {filteredFAQs.map((item) => {
                    const isOpen = openFAQ === item.id;
                    return (
                      <article key={item.id} className="help-faq-item">
                        <button
                          className="help-faq-question"
                          onClick={() => toggleFAQ(item.id)}
                          type="button"
                        >
                          <span>{item.question}</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {isOpen && <p className="help-faq-answer">{item.answer}</p>}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Help Topic Sections */}
            <section className="help-topic-grid">
              <article className="help-topic-card">
                <div className="help-topic-title">
                  <Package size={18} />
                  <h3>Order & Shipping Help</h3>
                </div>
                <ul>
                  <li>Track orders in real-time from the Track Order page.</li>
                  <li>Delivery estimate depends on location and stock readiness.</li>
                  <li>Courier and tracking details are shown once shipped.</li>
                </ul>
              </article>

              <article className="help-topic-card">
                <div className="help-topic-title">
                  <RotateCcw size={18} />
                  <h3>Returns & Refunds</h3>
                </div>
                <ul>
                  <li>Report damaged items within 24 hours of delivery.</li>
                  <li>Share clear photos and order ID for faster resolution.</li>
                  <li>Refund/replacement follows your return policy rules.</li>
                </ul>
              </article>

              <article className="help-topic-card">
                <div className="help-topic-title">
                  <CreditCard size={18} />
                  <h3>Payment Help</h3>
                </div>
                <ul>
                  <li>Use available payment options shown at checkout.</li>
                  <li>Retry failed payments after checking balance/network.</li>
                  <li>Do not retry repeatedly if money is already deducted.</li>
                </ul>
              </article>

              <article className="help-topic-card">
                <div className="help-topic-title">
                  <Truck size={18} />
                  <h3>Delivery Support</h3>
                </div>
                <ul>
                  <li>Keep your shipping phone active during delivery window.</li>
                  <li>Update address instructions before dispatch if needed.</li>
                  <li>Contact support for delayed or missed deliveries.</li>
                </ul>
              </article>
            </section>

            {/* Contact Support Section */}
            <section className="help-contact-support">
              <div className="help-section-head">
                <Headphones size={18} />
                <h2>Contact Support</h2>
              </div>

              <p>
                Still need help? Reach out to our support team and we will assist you quickly.
              </p>

              <div className="help-support-actions">
                <button type="button" onClick={() => navigate("/contact")}> 
                  <Mail size={16} />
                  Contact Form
                </button>
                <button type="button" onClick={() => navigate("/track-order")}> 
                  <Package size={16} />
                  Track an Order
                </button>
              </div>

              <div className="help-support-inline">
                <span>
                  <Phone size={14} /> +977-9800000000
                </span>
                <span>
                  <Mail size={14} /> support@nepalcozycare.com
                </span>
              </div>
            </section>
          </div>
        </section>
      </div>
    </Layout>
  );
}
