import type { AboutPageTemplatePayload } from "./types";
const emptyTemplate: Required<AboutPageTemplatePayload> = {
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
export let aboutPageTemplate = emptyTemplate;
export const applyAboutPageTemplate = (payload?: AboutPageTemplatePayload | null) => {
  aboutPageTemplate = {
    ...emptyTemplate,
    ...payload,
    hero: {
      ...emptyTemplate.hero,
      ...(payload?.hero ?? {}),
    },
    story: {
      ...emptyTemplate.story,
      ...(payload?.story ?? {}),
    },
    mission: {
      ...emptyTemplate.mission,
      ...(payload?.mission ?? {}),
    },
    values: {
      ...emptyTemplate.values,
      ...(payload?.values ?? {}),
    },
    why_choose_us: {
      ...emptyTemplate.why_choose_us,
      ...(payload?.why_choose_us ?? {}),
    },
    team: {
      ...emptyTemplate.team,
      ...(payload?.team ?? {}),
    },
    cta: {
      ...emptyTemplate.cta,
      ...(payload?.cta ?? {}),
    },
    stats: Array.isArray(payload?.stats) ? payload!.stats : [],
  };
};
