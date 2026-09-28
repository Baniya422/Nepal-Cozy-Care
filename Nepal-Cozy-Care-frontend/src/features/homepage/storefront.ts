export type HomeTile = {
  title: string;
  description: string;
  image: string;
  path: string;
  label: string;
  badge?: string;
};

export const sectionKeys = [
  'categories',
  'tabs_collection',
  'offers',
  'shop_the_look',
  'rooms',
  'best_sellers',
  'popular',
  'why_us',
  'journey',
  'shop',
  'smart_tools',
  'seasonal',
  'garden',
  'testimonials',
  'journal',
  'mission',
  'about',
  'faq',
] as const;

export type SectionKey = typeof sectionKeys[number];

export type HotspotItem = {
  id: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  name: string;
  subtitle?: string;
  price: number;
  rating?: number;
  image: string;
  path: string;
};

export type ShopTheLookContent = {
  title: string;
  subtitle: string;
  image: string;
  hotspots: HotspotItem[];
};

export type WhyUsItem = {
  icon: string;
  title: string;
  description: string;
};

export type WhyUsContent = {
  title: string;
  subtitle: string;
  items: WhyUsItem[];
};

export type TestimonialItem = {
  name: string;
  city: string;
  rating: number;
  plant: string;
  text: string;
  date: string;
  verified?: boolean;
};

export type TestimonialsContent = {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
};

export type TabsCollectionContent = {
  title: string;
  subtitle: string;
  active_tab?: string;
  tabs: { id: string; label: string; badge?: string }[];
};

export type StorefrontContent = {
  announcement: string;
  announcement_path: string;
  sections: { id: SectionKey; enabled: boolean }[];
  categories: { title: string; items: HomeTile[] };
  tabs_collection: TabsCollectionContent;
  offers: { title: string; items: HomeTile[] };
  shop_the_look: ShopTheLookContent;
  rooms: { title: string; items: HomeTile[] };
  why_us: WhyUsContent;
  journey: { title: string; items: HomeTile[] };
  testimonials: TestimonialsContent;
  journal: { title: string; items: HomeTile[] };
  faq: { title: string; items: { question: string; answer: string }[] };
};

const tile = (title: string, image: string, path: string, description = '', label = 'Explore', badge?: string): HomeTile => ({
  title,
  image,
  path,
  description,
  label,
  badge,
});

export const defaultStorefront: StorefrontContent = {
  announcement: '🌿 Free Valley Delivery on orders over Rs. 999 | 🌸 Use Code GREEN10 for 10% Off | 🩺 Free WhatsApp Plant Doctor Support',
  announcement_path: '/plant-finder',
  sections: sectionKeys.map((id) => ({ id, enabled: true })),
  categories: {
    title: 'Shop By Category',
    items: [
      tile('Plants', '/images/categories/plants.webp', '/plants', 'Indoor & Outdoor', 'Explore', 'Popular'),
      tile('Pots & Planters', '/images/categories/pots.webp', '/pots?category=pots', 'Ceramic & Fiber', 'Explore', 'Trending'),
      tile('Seeds', '/images/categories/seeds.webp', '/seeds', 'Herbs & Flowers', 'Explore'),
      tile('Soil & Nutrition', '/images/categories/soil.webp', '/pots?category=soil', 'Organic Mix', 'Explore'),
      tile('Garden Tools', '/images/categories/tools.webp', '/pots?category=tools', 'Pruners & Kits', 'Explore'),
      tile('Watering', '/images/categories/watering.webp', '/pots?category=watering', 'Cans & Sprayers', 'Explore'),
      tile('Plant Care', '/images/categories/care.webp', '/care-tips', 'Guides & Tips', 'Explore'),
      tile('Doctor Green', '/images/categories/fertiliser.webp', '/plant-health-checker', 'Plant Health Clinic', 'Explore', 'Plant Doctor'),
    ],
  },
  tabs_collection: {
    title: "Nepal's Favorite Greenery",
    subtitle: 'Healthy, lush indoor plants hand-inspected in Kathmandu and delivered in custom transit pods.',
    tabs: [
      { id: 'best_sellers', label: 'Best Sellers', badge: 'Top Rated' },
      { id: 'air_purifying', label: '🍃 Air Purifying', badge: 'NASA Tested' },
      { id: 'low_light', label: '☀️ Low Maintenance', badge: 'Beginner' },
      { id: 'ceramic_pots', label: '🪴 Designer Pots', badge: 'Handmade' },
    ],
  },
  offers: {
    title: 'Curated Essentials for Green Homes',
    items: [
      tile('Artisanal Ceramic Planters', '/images/pot3.webp', '/pots', 'Designed to elevate your indoor jungle with drainage & matching saucer trays.', 'Shop Planters', 'Bestseller'),
      tile('Non-GMO Seeds & Grow Kits', '/images/seeds_tomato.jpg', '/seeds', 'From crisp cherry tomatoes to fragrant culinary herbs, grow fresh food at home.', 'Start Growing', 'New Batch'),
    ],
  },
  shop_the_look: {
    title: 'Shop The Look: Modern Green Living Room',
    subtitle: 'Hover or tap the pulsing hotspots to discover the exact plants and designer planters in this cozy space.',
    image: '/images/HomeBackground.png',
    hotspots: [
      {
        id: 1,
        x: 52,
        y: 48,
        name: 'Monstera Deliciosa (XL)',
        subtitle: 'Iconic split-leaf tropical plant',
        price: 1450,
        rating: 4.9,
        image: '/images/mos.jpg',
        path: '/plants/1',
      },
      {
        id: 2,
        x: 32,
        y: 75,
        name: 'Minimalist Ceramic Planter',
        subtitle: 'Artisanal matte cream pot with saucer',
        price: 750,
        rating: 4.8,
        image: '/images/pot3.webp',
        path: '/pots',
      },
      {
        id: 3,
        x: 72,
        y: 65,
        name: 'Golden Brass Watering Can',
        subtitle: 'Long-spout precision watering can',
        price: 899,
        rating: 4.9,
        image: '/images/can.jpg',
        path: '/pots?category=watering',
      },
    ],
  },
  rooms: {
    title: 'Plants Curated For Every Space',
    items: [
      tile('Living Room', '/images/plantfinder/living-room.png', '/plants?location=living-room', 'Lush statement foliage', 'Shop Room'),
      tile('Bedroom', '/images/plantfinder/bedroom.png', '/plants?location=bedroom', 'Calming oxygen boosters', 'Shop Room'),
      tile('Balcony & Patio', '/images/plantfinder/balcony.png', '/plants?location=balcony', 'Sun-loving tropicals', 'Shop Room'),
      tile('Workspace & Desk', '/images/plantfinder/office.png', '/plants?location=workspace', 'Compact focus enhancers', 'Shop Room'),
    ],
  },
  why_us: {
    title: 'The Nepal Cozy Care Experience',
    subtitle: 'Why thousands of urban plant parents across Nepal trust our greenhouse to their homes.',
    items: [
      {
        icon: 'PackageCheck',
        title: 'Transit-Safe Packaging',
        description: 'Specially engineered breathable pods keep soil secure and foliage pristine on arrival.',
      },
      {
        icon: 'ShieldCheck',
        title: '7-Day Transit Guarantee',
        description: 'Instant, hassle-free replacement if your plant arrives stressed, damaged, or unhappy.',
      },
      {
        icon: 'Sprout',
        title: 'Valley-Acclimated Plants',
        description: 'Nurtured in our local Kathmandu greenhouses so they effortlessly adapt to your room climate.',
      },
      {
        icon: 'Stethoscope',
        title: 'Free Plant Doctor Advice',
        description: 'Lifetime WhatsApp & AI care guidance from certified horticulturists whenever you need help.',
      },
    ],
  },
  journey: {
    title: 'The Cozy Care Parenting Journey',
    items: [
      tile('1. Find Your Match', '/images/about-plants.jpg', '/plant-finder', 'Match plants to your room light, pet safety, and routine in 60 seconds.', 'Take Quiz'),
      tile('2. Safe Transit Delivery', '/images/plant-box.jpg', '/care-tips', 'Delivered in breathable eco-boxes with zero soil spill and a 7-day guarantee.', 'Unboxing Guide'),
      tile('3. Grow with Doctor Green', '/images/indoor-garden.jpg', '/my-garden', 'Keep watering logs and chat with certified plant doctors anytime.', 'Open My Garden'),
    ],
  },
  testimonials: {
    title: 'Loved By 25,000+ Plant Parents',
    subtitle: 'Real stories from urban gardeners across Kathmandu, Lalitpur, and Pokhara',
    items: [
      {
        name: 'Prashant Sharma',
        city: 'Baluwatar, Kathmandu',
        rating: 5,
        plant: 'Monstera Deliciosa (XL)',
        text: 'Arrived in Kathmandu in immaculate condition! Not a single leaf was torn, and the soil was still damp. The care card included is a lifesaver for beginners.',
        date: '2 days ago',
        verified: true,
      },
      {
        name: 'Aayusha Shrestha',
        city: 'Jhamsikhel, Lalitpur',
        rating: 5,
        plant: 'ZZ Plant + Ceramic Pot',
        text: 'The ceramic pot finish is top-tier luxury, exactly like high-end international stores. My ZZ plant is thriving on my office desk with zero fuss.',
        date: '1 week ago',
        verified: true,
      },
      {
        name: 'Rohan Adhikari',
        city: 'Lakeside, Pokhara',
        rating: 5,
        plant: 'Fiddle Leaf Fig',
        text: 'I was skeptical about plant delivery all the way to Pokhara, but it was packed so securely! Doctor Green answered my lighting questions right away.',
        date: '2 weeks ago',
        verified: true,
      },
      {
        name: 'Smriti Thapa',
        city: 'Suryabinayak, Bhaktapur',
        rating: 5,
        plant: 'Peace Lily Bloom',
        text: 'The white blooms were fresh and vibrant. The Plant Health Checker tool is so cool and practical. Will definitely order again!',
        date: '3 weeks ago',
        verified: true,
      },
    ],
  },
  journal: {
    title: 'The Green Journal & Guides',
    items: [
      tile('7 Air-Purifying Plants for Kathmandu Homes', '/images/blog-hero-lush.jpg', '/blogs', 'Combat valley smog naturally with these NASA-backed indoor species.', 'Read Guide'),
      tile('How to Diagnose Yellow Leaves Quickly', '/images/blog-leaf-macro.jpg', '/plant-health-checker', 'Learn the difference between overwatering, sunburn, and nutrient lock.', 'Diagnose Now'),
      tile('Winter Plant Care: Watering & Light Shifts', '/images/winter-garden.png', '/care-tips?category=seasonal', 'Simple tips to keep tropical plants happy during colder months in Nepal.', 'Read Care Tips'),
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      {
        question: 'How are plants safely delivered without damage or spilled soil?',
        answer: 'We use specially engineered transit pods with breathable perforated walls and secure root-collar locks. Plants arrive upright, intact, and pre-hydrated.',
      },
      {
        question: 'What if my plant arrives stressed or damaged during shipping?',
        answer: 'Every order is backed by our 7-Day Healthy Plant Guarantee. Simply snap a quick photo and contact us on WhatsApp (+977-9800000000) for a prompt free replacement.',
      },
      {
        question: 'Do plants come potted and ready to display?',
        answer: 'Yes! All our plants arrive potted in high-drainage organic potting mix. You can also pair them with our designer ceramic or self-watering planters.',
      },
      {
        question: 'Can I get care help after receiving my plant?',
        answer: 'Absolutely. Use our built-in AI Plant Health Checker, track watering in My Garden, or message our Kathmandu plant doctors on WhatsApp anytime for free advice.',
      },
    ],
  },
};

export function normalizeStorefront(value?: Partial<StorefrontContent>): StorefrontContent {
  const result: StorefrontContent = {
    ...defaultStorefront,
    ...value,
    categories: { ...defaultStorefront.categories, ...(value?.categories ?? {}) },
    tabs_collection: { ...defaultStorefront.tabs_collection, ...(value?.tabs_collection ?? {}) },
    offers: { ...defaultStorefront.offers, ...(value?.offers ?? {}) },
    shop_the_look: { ...defaultStorefront.shop_the_look, ...(value?.shop_the_look ?? {}) },
    rooms: { ...defaultStorefront.rooms, ...(value?.rooms ?? {}) },
    why_us: { ...defaultStorefront.why_us, ...(value?.why_us ?? {}) },
    journey: { ...defaultStorefront.journey, ...(value?.journey ?? {}) },
    testimonials: { ...defaultStorefront.testimonials, ...(value?.testimonials ?? {}) },
    journal: { ...defaultStorefront.journal, ...(value?.journal ?? {}) },
    faq: { ...defaultStorefront.faq, ...(value?.faq ?? {}) },
  };

  const seen = new Set<string>();
  const inputSections = Array.isArray(value?.sections) ? value.sections : defaultStorefront.sections;

  result.sections = inputSections.filter((section) => {
    if (!sectionKeys.includes(section.id) || seen.has(section.id)) return false;
    seen.add(section.id);
    return true;
  });

  // Ensure any newly introduced sectionKey is included if not present
  for (const key of sectionKeys) {
    if (!seen.has(key)) {
      result.sections.push({ id: key, enabled: true });
      seen.add(key);
    }
  }

  return result;
}
