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
