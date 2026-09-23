import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type ContentCard = { title: string; description: string };
export type SelectOption = { value: string; label: string };

export type ContactPageContent = {
  hero: { eyebrow: string; title: string; description: string; cards: ContentCard[] };
  info: {
    eyebrow: string;
    title: string;
    description: string;
    promises: string[];
    details: { label: string; value: string }[];
    note_title: string;
    note_description: string;
  };
  form: {
    title: string;
    description: string;
    name_placeholder: string;
    email_placeholder: string;
    order_placeholder: string;
    phone_placeholder: string;
    city_placeholder: string;
    message_placeholder: string;
    note: string;
    button_label: string;
    submitting_label: string;
    subject_options: SelectOption[];
    contact_method_options: SelectOption[];
  };
  banner_images: { image: string; alt: string }[];
};

export type ShippingPageContent = {
  hero: { background_image: string; title_lines: string[]; button_label: string; button_path: string };
  about: { title: string; description: string; button_label: string; button_path: string; image: string; image_alt: string };
  delivery: { title: string; image: string; image_alt: string; options: ContentCard[] };
  benefits: { title: string; image: string; image_alt: string; items: ContentCard[] };
  testimonials: {
    title: string;
    items: { name: string; role: string; rating: number; quote: string; image: string; image_alt: string; featured: boolean }[];
  };
};

export const defaultContactContent: ContactPageContent = {
  hero: {
    eyebrow: "Contact Cozy Care",
    title: "Talk to us about orders, delivery locations, and plant care.",
    description: "Use this page for general support, order follow-up, and delivery help. After an order is placed, our admin team can call, email, or WhatsApp you to confirm the address and make delivery smoother.",
    cards: [
      { title: "Order Confirmation", description: "Get quick help for order approval, delivery timing, or callback requests." },
      { title: "Location Check", description: "Add landmarks and delivery notes so admin can confirm the exact location." },
      { title: "Plant Care Help", description: "Ask for plant care guidance, post-purchase support, or product suggestions." },
    ],
  },
  info: {
    eyebrow: "Support Channels",
    title: "We help with delivery, orders, and healthy plants.",
    description: "Reach out if you need help before ordering, after checkout, or while waiting for delivery. Include your order number if your message is about a recent purchase.",
    promises: ["Order support and confirmation guidance", "Location and landmark clarification", "Plant care help after purchase"],
    details: [
      { label: "Email", value: "support@cozycare.com" },
      { label: "Call or WhatsApp", value: "+977 9876543211" },
      { label: "Delivery Support Base", value: "Kathmandu Valley, Nepal" },
      { label: "Mon - Sat 9:00 - 18:00", value: "Sunday Closed" },
    ],
    note_title: "Best way to get faster help",
    note_description: "For delivery questions, include your order number, city, and a nearby landmark. That makes it much easier for our admin team to confirm the location with you.",
  },
  form: {
    title: "Send a support request",
    description: "Choose the topic and how you want us to contact you back. For order issues, add the order number if you have it.",
    name_placeholder: "Your name*",
    email_placeholder: "Email*",
    order_placeholder: "Order Number (optional)",
    phone_placeholder: "Phone Number*",
    city_placeholder: "City / Delivery Area*",
    message_placeholder: "Tell us what you need help with. If this is a delivery issue, include landmarks or location clarification.",
    note: "Admin will use your preferred contact method to reply or confirm order details.",
    button_label: "Send Support Request",
    submitting_label: "Sending...",
    subject_options: [
      { value: "general_inquiry", label: "General Inquiry" },
      { value: "order_support", label: "Order Support" },
      { value: "delivery_help", label: "Delivery Help" },
      { value: "plant_care", label: "Plant Care" },
      { value: "bulk_order", label: "Bulk Order" },
    ],
    contact_method_options: [
      { value: "phone", label: "Call Me" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "email", label: "Email" },
    ],
  },
  banner_images: [
    { image: "/images/nepal-mountains.jpg", alt: "Nepal Mountains" },
    { image: "/images/nepal-stupa.jpg", alt: "Nepal Stupa" },
    { image: "/images/nepal-plane.jpg", alt: "Nepal Plane" },
    { image: "/images/nepal-landscape.jpg", alt: "Nepal Landscape" },
  ],
};

export const defaultShippingContent: ShippingPageContent = {
  hero: { background_image: "/images/shipping-hero.jpg", title_lines: ["Welcome to", "Delivery and", "Shipping Services"], button_label: "Read more", button_path: "/shipping#delivery-options" },
  about: { title: "How We Deliver", description: "We understand how precious your plants are. That's why we've developed a specialized packaging system using eco-friendly materials that protect your green friends during transit. Every plant is carefully secured, watered, and packed with love before leaving our greenhouse.", button_label: "Our Packaging", button_path: "/shipping#delivery-options", image: "/images/plant-box.jpg", image_alt: "Secure plant packaging" },
  delivery: { title: "Delivery Options", image: "/images/delivery-person.jpg", image_alt: "Our delivery team", options: [
    { title: "Same-Day Delivery", description: "Order before 2 PM and get your plants delivered the same day within Kathmandu city limits." },
    { title: "Valley-Wide Shipping", description: "We deliver to Lalitpur, Bhaktapur, and surrounding areas within 24-48 hours." },
  ] },
  benefits: { title: "Why Choose Us", image: "/images/package-delivery.jpg", image_alt: "Package delivery", items: [
    { title: "Safe Package", description: "Specialized plant-safe packaging protects leaves, soil, and pots during transport." },
    { title: "Fast Delivery", description: "Reliable local delivery with clear timing and order updates." },
    { title: "Helpful Support", description: "Contact our team for delivery updates, location checks, or plant-care questions." },
  ] },
  testimonials: { title: "What Our Customers Say", items: [
    { name: "John Doe", role: "Customer", rating: 5, quote: "My plants arrived healthy and securely packed. The delivery updates were clear and helpful.", image: "/images/team-emily.jpg", image_alt: "Customer John Doe", featured: false },
    { name: "Jane Smith", role: "Customer", rating: 5, quote: "Exceptional service and a very professional team. Everything arrived safely and on time.", image: "/images/team-sarah.jpg", image_alt: "Customer Jane Smith", featured: true },
  ] },
};

export const defaultOurMissionContent = {
  hero: {
    eyebrow: "Our Purpose",
    title: "Growing Better Plant Habits, One Home at a Time",
    lead: "Cozy Care exists to make plant parenting simple, rewarding, and sustainable. We combine care knowledge, thoughtful products, and everyday support so anyone can build a thriving indoor garden without feeling overwhelmed.",
    image: "/images/mission-hero.jpg",
    image_alt: "Indoor plants arranged in a calm, cozy home setting",
    floating_note_top: "Plant care should feel calm, not confusing.",
    floating_note_bottom: "Designed for real homes, real routines, and long-term care.",
    primary_cta: { label: "Explore Plants", path: "/plants" },
    secondary_cta: { label: "Read Care Tips", path: "/care-tips" },
    highlights: [
      { label: "Beginner-first guidance", value: "Simple care advice" },
      { label: "Thoughtful shopping", value: "Plants that fit real homes" },
      { label: "Long-term support", value: "Tips that continue after checkout" },
    ],
  },
  story: {
    kicker: "Why We Built Cozy Care",
    title: "We are designing a friendlier plant experience from the start.",
    description: "Many people love the idea of plants but feel unsure once they bring one home. Our mission is to remove that friction through better guidance, better product choices, and a more supportive journey after someone buys.",
    bullets: [
      "Less guesswork when choosing plants",
      "More confidence in everyday care",
      "Support that continues beyond checkout",
    ],
    quote_text: "Plants should bring peace and beauty to your space, not stress. We are here to guide your green journey every single step of the way.",
    quote_caption: "Cozy Care Botanical Team, Kathmandu",
  },
  pillars_section: {
    kicker: "Four Pillars",
    title: "How we make plant care dependable and joyful",
    pillars: [
      { eyebrow: "01", title: "Living Selection", description: "Every plant is inspected, acclimatized to Nepal's climate, and selected for durability." },
      { eyebrow: "02", title: "Care Guidance", description: "Straightforward care instructions, hydration rhythms, and troubleshooting before issues spread." },
      { eyebrow: "03", title: "Eco-Packaging", description: "Shock-proof, breathable, and biodegradable packaging for secure Kathmandu valley transport." },
      { eyebrow: "04", title: "Lifelong Community", description: "Direct access to our horticulturists, workshops, and seasonal reminder alerts." },
    ],
  },
  support_section: {
    kicker: "Lifetime Promise",
    title: "Three steps from greenhouse to your window sill",
    steps: [
      { step: "01", title: "Discover plants that fit your lifestyle", description: "Choose plants based on your room's natural sunlight, humidity, and your weekly schedule." },
      { step: "02", title: "Get clear help before problems grow", description: "Care tips, plant doctor diagnoses, and seasonal warnings are always free to access." },
      { step: "03", title: "Build routines that last", description: "Our goal is not just a successful delivery, but helping you keep plants flourishing for years." },
    ],
  },
  vision: {
    kicker: "Our Vision",
    title: "Make greenery feel accessible, personal, and lasting.",
    description: "We envision a future where caring for plants becomes an effortless part of daily wellness in every Nepali household.",
  },
  impact: {
    kicker: "How We Measure Impact",
    title: "We care about living outcomes, not just orders.",
    goals: [
      "Guided care journeys for first-time plant parents",
      "Reliable product recommendations based on lifestyle",
      "Seasonal tips tailored for local Nepal climate conditions",
      "A friendly support experience from browsing to delivery",
    ],
  },
};

export const defaultAboutContent = {
  hero: {
    title: "Our Plant Journey",
    subtitle: "Started from a passion for botanical life in Kathmandu, Nepal Cozy Care began with a simple mission: make plant parenting effortless, joyful, and sustainable for everyone.",
    primary_cta: { label: "Browse Plants", path: "/plants" },
    secondary_cta: { label: "Get in Touch", path: "/contact" },
  },
  stats: [
    { value: "10,000+", label: "Happy Customers" },
    { value: "500+", label: "Plant Varieties" },
    { value: "15", label: "Years Experience" },
    { value: "98%", label: "Satisfaction Rate" },
  ],
  story: {
    label: "Our Story",
    title: "Growing Green Dreams Across Nepal",
    paragraphs: [
      "What started as a small passion project in a Kathmandu nursery has blossomed into a community dedicated to bringing the beauty, health, and tranquility of living plants into homes and workspaces across Nepal.",
      "Our botanists personally propagate and care for each plant, ensuring it is naturally acclimatized to thrive in indoor settings with minimal stress.",
      "We believe that everyone deserves to experience the restorative joy of nurturing plants, and we're here to guide you every step of the way.",
    ],
    button: { label: "Explore Our Plants", path: "/plants" },
    image: "/images/about-story.jpg",
    image_alt: "Plant care and propagation",
    quote_text: "\"We are not just selling plants; we are nurturing greener, calmer homes and lasting plant relationships.\"",
    quote_author: "- Cozy Care Botanical Team",
  },
  mission: {
    title: "Our Mission & Vision",
    subtitle: "Committed to greener, healthier living spaces across Nepal.",
    cards: [
      {
        icon: "Leaf",
        title: "Our Mission",
        text: "To inspire and empower everyone to connect with nature through premium, healthy plants, expert horticultural guidance, and sustainable practices.",
      },
      {
        icon: "Globe",
        title: "Our Vision",
        text: "To build a vibrant community of plant lovers where anyone can learn, grow, and surround themselves with natural beauty.",
      },
    ],
  },
  values: {
    title: "Our Core Values",
    subtitle: "The principles that cultivate everything we do at Cozy Care.",
    items: [
      { icon: "Leaf", title: "Sustainability", description: "Eco-friendly packaging and conscious propagation methods." },
      { icon: "Heart", title: "Botanical Quality", description: "Every plant is inspected, conditioned, and guaranteed healthy." },
      { icon: "Users", title: "Community First", description: "Sharing knowledge, seasonal reminders, and friendly support." },
      { icon: "Award", title: "Care Excellence", description: "Ongoing expert support even long after your plant arrives." },
    ],
  },
  why_choose_us: {
    title: "Why Choose Cozy Care?",
    image: "/images/about-plants.jpg",
    image_alt: "Healthy indoor plants",
    items: [
      { icon: "CheckCircle", title: "Transit Guarantee", description: "Every plant is backed by our 30-day health and safe arrival guarantee." },
      { icon: "HeadphonesIcon", title: "Expert Botanist Support", description: "Our team of plant specialists is always ready to advise on watering, pests, and light." },
      { icon: "Leaf", title: "Sustainable Packaging", description: "Biodegradable, shock-proof packaging tailored for valley delivery." },
      { icon: "Globe", title: "Curated Variety", description: "Dozens of air-purifying, pet-safe, and low-light varieties suited to local homes." },
    ],
  },
  team: {
    title: "Meet Our Team",
    subtitle: "The passionate horticulturists, green thumbs, and logistics specialists behind Nepal Cozy Care.",
    members: [
      { name: "Prashant Baniya", role: "Founder & Lead Curator", bio: "Horticulture enthusiast dedicated to making plant parenthood effortless.", image: "/images/team-sarah.jpg" },
      { name: "Aarav Sharma", role: "Greenhouse Botanist", bio: "Specialist in soil ecology, propagation, and natural pest control remedies.", image: "/images/team-michael.jpg" },
      { name: "Sneha Shrestha", role: "Plant Health Specialist", bio: "Passionate about diagnosing plant symptoms and teaching care routines.", image: "/images/team-emily.jpg" },
      { name: "Bikash Adhikari", role: "Care & Logistics", bio: "Ensuring every delicate plant arrives in pristine condition at your doorstep.", image: "/images/team-david.jpg" },
    ],
  },
  cta: {
    title: "Ready to Transform Your Space?",
    subtitle: "Find the perfect plant companion for your home or office today.",
    primary_cta: { label: "Shop Plants", path: "/plants" },
    secondary_cta: { label: "Contact Us", path: "/contact" },
  },
};

export const defaultBlogsContent = {
  hero: {
    kicker: "Nepal Cozy Care Botanical Journal & Care Stories",
    title_main: "Stories from the Soil:",
    title_highlight: "Cultivating Life & Serenity",
    subtitle: "Deep-dive care handbooks, interior styling guides, Nepal seasonal secrets, and expert wisdom from our greenhouse botanists to your living room.",
    search_placeholder: "Search plant species, care problems, monsoon advice, or hacks...",
    search_button_text: "Find Guides",
    background_image: "/images/blog-hero-lush.jpg",
    badge_1: "60+ Deep-Dive Guides",
    badge_2: "12,000+ Readers in Nepal",
    badge_3: "100% Expert Botanist Verified",
  },
  newsletter: {
    title: "Join 15,000+ Nepal Plant Enthusiasts",
    subtitle: "Receive Kathmandu seasonal potting alerts, urgent monsoon humidity warnings, and care guides directly to your inbox every Sunday morning.",
    button_text: "Subscribe Free",
  },
};

export function useContentTemplate<T>(key: string, fallback: T): T {
  const [content, setContent] = useState<T>(fallback);
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API}/api/content-templates/${key}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.data?.payload) setContent(data.data.payload as T);
      } catch (error) {
        console.error(`Could not load ${key} content:`, error);
      }
    };
    void load();
    const handleUpdate = () => {
      void load();
    };
    window.addEventListener("cozycare:content-updated", handleUpdate);
    return () => {
      window.removeEventListener("cozycare:content-updated", handleUpdate);
    };
  }, [key]);
  return content;
}

export function resolvePageImage(path: string): string {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
  return `${API}/storage/${path}`;
}
