export type CtaContent = {
  label: string;
  path: string;
};

export type TextCardContent = {
  title: string;
  description: string;
};

export type ToolContent = TextCardContent & {
  action: string;
  path: string;
};

export type ProductSectionContent = {
  title: string;
  empty_message: string;
  button_label: string;
  button_path: string;
};

export type InfoSectionContent = {
  title: string;
  description: string;
  button_label: string;
  button_path: string;
  image: string;
  image_alt: string;
};

export type HomepageContent = {
  hero: {
    background_image: string;
    badge: string;
    title: string;
    description: string;
    primary_cta: CtaContent;
    secondary_cta: CtaContent;
    highlights: string[];
  };
  features: TextCardContent[];
  smart_tools: {
    kicker: string;
    title: string;
    description: string;
    items: ToolContent[];
  };
  seasonal: {
    kicker: string;
    title: string;
    description: string;
    badge_suffix: string;
    primary_cta: CtaContent;
    secondary_cta: CtaContent;
    empty_title_suffix: string;
    empty_description: string;
    empty_action: CtaContent;
  };
  product_sections: {
    popular: ProductSectionContent;
    shop: ProductSectionContent;
    best_sellers: ProductSectionContent;
  };
  garden: InfoSectionContent;
  mission: InfoSectionContent;
  about: {
    title: string;
    description: string;
    button_label: string;
    button_path: string;
  };
};

export const defaultHomepageContent: HomepageContent = {
  hero: {
    background_image: "/images/HomeBackground.png",
    badge: "Fresh From Our Greenhouse",
    title: "Bring Nature Home",
    description:
      "Shop healthy indoor plants, discover the right plant for your room, diagnose common plant problems, and track care routines after purchase in one system built for Nepali homes.",
    primary_cta: { label: "Explore Plants", path: "/plants" },
    secondary_cta: { label: "Find My Plant", path: "/plant-finder" },
    highlights: ["My Garden care tracking", "Plant Finder quiz", "Plant Health Checker"],
  },
  features: [
    { title: "Healthy Guarantee", description: "Every plant checked before delivery" },
    { title: "Plant Doctor", description: "Free care advice via WhatsApp" },
    { title: "Free Delivery", description: "All over Kathmandu Valley" },
  ],
  smart_tools: {
    kicker: "Smart Plant Care",
    title: "More than shopping. A complete plant care system.",
    description: "These tools help users discover, diagnose, and care for plants in one place.",
    items: [
      { title: "Plant Finder", description: "Match plants to sunlight, room type, and care confidence before you buy.", action: "Find My Plant", path: "/plant-finder" },
      { title: "Plant Health Checker", description: "Check symptoms like yellow leaves or pests and get quick care guidance.", action: "Diagnose Issues", path: "/plant-health-checker" },
      { title: "My Garden Dashboard", description: "Track watering, fertilizer routines, and personal notes after purchase.", action: "Open My Garden", path: "/my-garden" },
    ],
  },
  seasonal: {
    kicker: "Seasonal Reminder Preview",
    title: "Homepage care advice that updates with the season.",
    description: "Timely plant-care guidance from your published seasonal reminders.",
    badge_suffix: "guidance is active now",
    primary_cta: { label: "Explore Care Tips", path: "/care-tips" },
    secondary_cta: { label: "Open My Garden", path: "/my-garden" },
    empty_title_suffix: "preview",
    empty_description: "Add reminder cards from the admin panel and they will show here as fresh, seasonal guidance for users.",
    empty_action: { label: "Open seasonal care tips", path: "/care-tips?category=seasonal" },
  },
  product_sections: {
    popular: { title: "Popular Items", empty_message: "No popular items available yet.", button_label: "VIEW ALL", button_path: "/popular-items" },
    shop: { title: "Shop Plants", empty_message: "No shop plants available yet.", button_label: "VIEW ALL", button_path: "/plants" },
    best_sellers: { title: "Best Sellers", empty_message: "No best sellers available yet.", button_label: "VIEW ALL", button_path: "/best-sellers" },
  },
  garden: {
    title: "Visit Our Greenhouse",
    description: "Step into our lush greenhouse in Kathmandu where we nurture over 200 varieties of plants. From rare succulents to flowering beauties, each plant gets personalized care before finding its forever home with you.",
    button_label: "Plant Care Tips",
    button_path: "/care-tips",
    image: "/images/about-plants.jpg",
    image_alt: "Our greenhouse in Kathmandu",
  },
  mission: {
    title: "Our Mission",
    description: "We believe every Nepali home deserves a touch of green. Our goal is to make plant parenting accessible to everyone - whether you're a busy professional or a retired gardening enthusiast. Let's grow together!",
    button_label: "Read Our Blog",
    button_path: "/blogs",
    image: "/images/mission-hero.jpg",
    image_alt: "Our mission",
  },
  about: {
    title: "About Nepal Cozy Care",
    description: "We're a Kathmandu-based plant shop passionate about bringing greenery into urban homes. Our team hand-picks each plant from local nurseries, ensuring you get only the healthiest specimens. Plus, we provide lifetime care support - because we're plant parents too!",
    button_label: "Our Story",
    button_path: "/about",
  },
};

export function resolveHomepageImage(path: string, apiBaseUrl: string): string {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
  return `${apiBaseUrl}/storage/${path}`;
}

export type HomepageFallbackPlant = {
  id: number;
  name: string;
  subtitle?: string;
  price: number;
  image: string;
  avg_rating: number;
  review_count?: number;
  badge?: string;
  discount_percent?: number;
};

export const popularFallbackPlants: HomepageFallbackPlant[] = [
  { id: 1, name: "Monstera Deliciosa", subtitle: "Iconic Swiss cheese plant for living spaces", price: 1450, image: "/images/mos.jpg", avg_rating: 4.8, review_count: 183, badge: "BESTSELLER", discount_percent: 20 },
  { id: 9, name: "ZZ Plant", subtitle: "Low-maintenance, beginner-friendly foliage", price: 1199, image: "/images/zzplant.jpg", avg_rating: 4.8, review_count: 145, badge: "BESTSELLER", discount_percent: 17 },
  { id: 3, name: "Money Plant Variegated", subtitle: "Variegated leaves attract luck & fresh air", price: 600, image: "/images/pothos.jpg", avg_rating: 4.9, review_count: 101, badge: "TRENDING", discount_percent: 20 },
  { id: 2, name: "Fiddle Leaf Fig Tree", subtitle: "Stately indoor tree with violin-shaped leaves", price: 2200, image: "/images/fiddle.jpg", avg_rating: 4.8, review_count: 92, badge: "FEATURED", discount_percent: 15 },
  { id: 7, name: "Peace Lily Bloom", subtitle: "Air-purifying tropical stunner with white blooms", price: 950, image: "/images/lily.jpg", avg_rating: 4.8, review_count: 111, badge: "BESTSELLER", discount_percent: 13 },
  { id: 5, name: "Snake Plant Laurentii", subtitle: "Hardy air purifier thrives on neglect", price: 850, image: "/images/snake.jpg", avg_rating: 4.9, review_count: 164, badge: "POPULAR", discount_percent: 15 },
  { id: 6, name: "Rubber Plant Burgundy", subtitle: "Glossy deep-burgundy statement foliage", price: 1150, image: "/images/rubber.jpg", avg_rating: 4.8, review_count: 78, badge: "FEATURED", discount_percent: 20 },
  { id: 4, name: "Areca Butterfly Palm", subtitle: "Tropical feathery fronds for natural humidity", price: 1750, image: "/images/palm.jpg", avg_rating: 4.8, review_count: 89, badge: "BESTSELLER", discount_percent: 15 },
];

export const shopFallbackPlants: HomepageFallbackPlant[] = [
  { id: 5, name: "Snake Plant Laurentii", subtitle: "Hardy air purifier thrives on neglect", price: 850, image: "/images/snake.jpg", avg_rating: 4.9, review_count: 164, badge: "BESTSELLER", discount_percent: 15 },
  { id: 6, name: "Rubber Plant Burgundy", subtitle: "Glossy deep-burgundy statement foliage", price: 1150, image: "/images/rubber.jpg", avg_rating: 4.8, review_count: 78, badge: "POPULAR", discount_percent: 20 },
  { id: 7, name: "Peace Lily Bloom", subtitle: "Long-lasting indoor blooms & shade lover", price: 950, image: "/images/lily.jpg", avg_rating: 4.8, review_count: 111, badge: "BESTSELLER", discount_percent: 13 },
  { id: 8, name: "Aloe Vera Medicinal", subtitle: "Soothing natural gel succulent for sunny windows", price: 450, image: "/images/alovera.jpg", avg_rating: 4.7, review_count: 54, badge: "EASY CARE", discount_percent: 18 },
  { id: 1, name: "Monstera Deliciosa", subtitle: "Iconic Swiss cheese plant for living spaces", price: 1450, image: "/images/mos.jpg", avg_rating: 4.8, review_count: 183, badge: "BESTSELLER", discount_percent: 20 },
  { id: 9, name: "ZZ Plant", subtitle: "Low-maintenance, beginner-friendly foliage", price: 1199, image: "/images/zzplant.jpg", avg_rating: 4.8, review_count: 145, badge: "BESTSELLER", discount_percent: 17 },
  { id: 3, name: "Golden Pothos Devil's Ivy", subtitle: "Cascading indoor vine for shelves & hangers", price: 600, image: "/images/pothos.jpg", avg_rating: 4.8, review_count: 101, badge: "TRENDING", discount_percent: 20 },
  { id: 4, name: "Areca Butterfly Palm", subtitle: "Tropical feathery fronds for natural humidity", price: 1750, image: "/images/palm.jpg", avg_rating: 4.8, review_count: 89, badge: "BESTSELLER", discount_percent: 15 },
];

export const bestSellersFallbackPlants: HomepageFallbackPlant[] = [
  { id: 9, name: "ZZ Plant", subtitle: "Low-maintenance, beginner-friendly foliage", price: 1199, image: "/images/zzplant.jpg", avg_rating: 4.8, review_count: 183, badge: "BESTSELLER", discount_percent: 17 },
  { id: 3, name: "Money Plant Variegated", subtitle: "Variegated leaves attract luck & fresh air", price: 499, image: "/images/pothos.jpg", avg_rating: 4.9, review_count: 101, badge: "BESTSELLER", discount_percent: 17 },
  { id: 7, name: "Peace Lily Bloom", subtitle: "Long-lasting indoor blooms & shade lover", price: 699, image: "/images/lily.jpg", avg_rating: 4.8, review_count: 111, badge: "BESTSELLER", discount_percent: 13 },
  { id: 1, name: "Monstera Deliciosa", subtitle: "Iconic Swiss cheese plant for living spaces", price: 1450, image: "/images/mos.jpg", avg_rating: 4.9, review_count: 195, badge: "BESTSELLER", discount_percent: 20 },
  { id: 4, name: "Areca Butterfly Palm", subtitle: "Tropical feathery fronds for natural humidity", price: 1750, image: "/images/palm.jpg", avg_rating: 4.8, review_count: 89, badge: "BESTSELLER", discount_percent: 15 },
  { id: 5, name: "Snake Plant Laurentii", subtitle: "Hardy air purifier thrives on neglect", price: 850, image: "/images/snake.jpg", avg_rating: 4.9, review_count: 164, badge: "POPULAR", discount_percent: 15 },
  { id: 2, name: "Fiddle Leaf Fig Tree", subtitle: "Stately indoor tree with violin-shaped leaves", price: 2200, image: "/images/fiddle.jpg", avg_rating: 4.9, review_count: 92, badge: "FEATURED", discount_percent: 15 },
  { id: 6, name: "Rubber Plant Burgundy", subtitle: "Glossy deep-burgundy statement foliage", price: 1150, image: "/images/rubber.jpg", avg_rating: 4.8, review_count: 78, badge: "POPULAR", discount_percent: 20 },
];
