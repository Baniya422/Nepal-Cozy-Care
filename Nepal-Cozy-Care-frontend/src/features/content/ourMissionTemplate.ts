import type { OurMissionTemplatePayload } from "./types";

const emptyTemplate: Required<OurMissionTemplatePayload> = {
  hero: {
    eyebrow: "",
    title: "",
    lead: "",
    image: "",
    image_alt: "",
    floating_note_top: "",
    floating_note_bottom: "",
    primary_cta: { label: "", path: "/" },
    secondary_cta: { label: "", path: "/" },
    highlights: [],
  },
  story: {
    kicker: "",
    title: "",
    description: "",
    bullets: [],
    quote_text: "",
    quote_caption: "",
  },
  pillars_section: {
    kicker: "",
    title: "",
    pillars: [],
  },
  support_section: {
    kicker: "",
    title: "",
    steps: [],
  },
  vision: {
    kicker: "",
    title: "",
    description: "",
  },
  impact: {
    kicker: "",
    title: "",
    goals: [],
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

