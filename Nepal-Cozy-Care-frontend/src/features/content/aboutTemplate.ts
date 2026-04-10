import type { AboutPageTemplatePayload } from "./types";

const emptyTemplate: Required<AboutPageTemplatePayload> = {
  hero: {
    title: "",
    subtitle: "",
    primary_cta: { label: "", path: "/" },
    secondary_cta: { label: "", path: "/" },
  },
  stats: [],
  story: {
    label: "",
    title: "",
    paragraphs: [],
    button: { label: "", path: "/" },
    image: "",
    image_alt: "",
    quote_text: "",
    quote_author: "",
  },
  mission: {
    title: "",
    subtitle: "",
    cards: [],
  },
  values: {
    title: "",
    subtitle: "",
    items: [],
  },
  why_choose_us: {
    title: "",
    image: "",
    image_alt: "",
    items: [],
  },
  team: {
    title: "",
    subtitle: "",
    members: [],
  },
  cta: {
    title: "",
    subtitle: "",
    primary_cta: { label: "", path: "/" },
    secondary_cta: { label: "", path: "/" },
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

