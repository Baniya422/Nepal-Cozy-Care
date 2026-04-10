import { useEffect, useMemo, useState } from "react";
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
  HelpCircle,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/help-center.css";

type HelpCategory = string;

type HelpCategoryOption = {
  key: HelpCategory;
  label: string;
};

type FAQItem = {
  id: number;
  category: HelpCategory;
  question: string;
  answer: string;
};

type HelpTopicCard = {
  id: string;
  icon?: string;
  title: string;
  points: string[];
};

type HelpCenterTemplatePayload = {
  categories?: HelpCategoryOption[];
  faq_items?: FAQItem[];
  topic_cards?: HelpTopicCard[];
  support_intro?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
};

const topicIconMap = {
  Package,
  RotateCcw,
  CreditCard,
  Truck,
} as const;

const getTopicIcon = (icon?: string) =>
  topicIconMap[icon as keyof typeof topicIconMap] ?? HelpCircle;

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TEMPLATE_CACHE_KEY = "help_center_template_v1";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? "5000");
const DEFAULT_SUPPORT_INTRO =
  "Still need help? Reach out to our support team and we will assist you quickly.";
const DEFAULT_SUPPORT_PHONE = "+977-9800000000";
const DEFAULT_SUPPORT_EMAIL = "support@nepalcozycare.com";

export default function HelpCenter() {
  const navigate = useNavigate();

  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<HelpCategory>("all");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const [helpCategories, setHelpCategories] = useState<HelpCategoryOption[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [topicCards, setTopicCards] = useState<HelpTopicCard[]>([]);
  const [supportIntro, setSupportIntro] = useState(DEFAULT_SUPPORT_INTRO);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SUPPORT_PHONE);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SUPPORT_EMAIL);

  useEffect(() => {
    let isMounted = true;
    let hasCachedTemplate = false;

    const applyTemplate = (data: HelpCenterTemplatePayload) => {
      const fetchedCategories = Array.isArray(data.categories) ? data.categories : [];
      const categories =
        fetchedCategories.some((category) => category.key === "all")
          ? fetchedCategories
          : [{ key: "all", label: "All" }, ...fetchedCategories];

      setHelpCategories(categories);
      setFaqItems(Array.isArray(data.faq_items) ? data.faq_items : []);
      setTopicCards(Array.isArray(data.topic_cards) ? data.topic_cards : []);
      setSupportIntro(data.support_intro?.trim() || DEFAULT_SUPPORT_INTRO);
      setSupportPhone(data.contact_phone?.trim() || DEFAULT_SUPPORT_PHONE);
      setSupportEmail(data.contact_email?.trim() || DEFAULT_SUPPORT_EMAIL);
      setActiveCategory("all");
      setOpenFAQ(null);
    };

    const readCachedTemplate = (): HelpCenterTemplatePayload | null => {
      try {
        const cached = localStorage.getItem(TEMPLATE_CACHE_KEY);
        if (!cached) return null;
        return JSON.parse(cached) as HelpCenterTemplatePayload;
      } catch {
        return null;
      }
    };

    const cachedTemplate = readCachedTemplate();
    if (cachedTemplate && isMounted) {
      applyTemplate(cachedTemplate);
      hasCachedTemplate = true;
      setTemplateLoading(false);
    }

    const loadTemplate = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      try {
        const response = await fetch(`${API}/api/help-center/template`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Could not load help content.");
        }

        const payload = await response.json().catch(() => ({}));
        const data = (payload?.data ?? {}) as HelpCenterTemplatePayload;
        localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(data));

        if (isMounted) {
          applyTemplate(data);
          setTemplateError(null);
          setTemplateLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          if (!hasCachedTemplate) {
            setTemplateError(
              error instanceof DOMException && error.name === "AbortError"
                ? "Help center template request timed out. Check backend server."
                : error instanceof Error
                  ? error.message
                  : "Could not load help content."
            );
            setTemplateLoading(false);
          }
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void loadTemplate();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFAQs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory, faqItems]);

  const toggleFAQ = (id: number) => {
    setOpenFAQ((previous) => (previous === id ? null : id));
  };

  return (
    <Layout>
      <div className="help-center-page">
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
            {templateLoading ? (
              <div className="help-empty">Loading help content...</div>
            ) : templateError ? (
              <div className="help-empty">{templateError}</div>
            ) : (
              <>
                <div className="help-search-bar">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search help topics..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

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

                            {isOpen ? <p className="help-faq-answer">{item.answer}</p> : null}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="help-topic-grid">
                  {topicCards.map((topic) => {
                    const TopicIcon = getTopicIcon(topic.icon);

                    return (
                      <article key={topic.id} className="help-topic-card">
                        <div className="help-topic-title">
                          <TopicIcon size={18} />
                          <h3>{topic.title}</h3>
                        </div>
                        <ul>
                          {topic.points.map((point, index) => (
                            <li key={`${topic.id}-${index}`}>{point}</li>
                          ))}
                        </ul>
                      </article>
                    );
                  })}
                </section>
              </>
            )}

            <section className="help-contact-support">
              <div className="help-section-head">
                <Headphones size={18} />
                <h2>Contact Support</h2>
              </div>

              <p>{supportIntro}</p>

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
                  <Phone size={14} /> {supportPhone}
                </span>
                <span>
                  <Mail size={14} /> {supportEmail}
                </span>
              </div>
            </section>
          </div>
        </section>
      </div>
    </Layout>
  );
}
