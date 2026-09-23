import type { OurMissionTemplatePayload } from "./types";
const emptyTemplate: Required<OurMissionTemplatePayload> = {
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
export let ourMissionTemplate = emptyTemplate;
export const applyOurMissionTemplate = (payload?: OurMissionTemplatePayload | null) => {
  ourMissionTemplate = {
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
    pillars_section: {
      ...emptyTemplate.pillars_section,
      ...(payload?.pillars_section ?? {}),
    },
    support_section: {
      ...emptyTemplate.support_section,
      ...(payload?.support_section ?? {}),
    },
    vision: {
      ...emptyTemplate.vision,
      ...(payload?.vision ?? {}),
    },
    impact: {
      ...emptyTemplate.impact,
      ...(payload?.impact ?? {}),
    },
  };
};
