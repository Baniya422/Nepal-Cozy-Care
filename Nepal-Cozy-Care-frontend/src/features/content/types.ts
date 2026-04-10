export type TemplateCTA = {
  label: string;
  path: string;
};

export type AboutHeroTemplate = {
  title: string;
  subtitle: string;
  primary_cta: TemplateCTA;
  secondary_cta: TemplateCTA;
};

export type AboutStatTemplate = {
  value: string;
  label: string;
};

export type AboutStoryTemplate = {
  label: string;
  title: string;
  paragraphs: string[];
  button: TemplateCTA;
  image: string;
  image_alt: string;
  quote_text: string;
  quote_author: string;
};

export type AboutMissionCardTemplate = {
  icon: string;
  title: string;
  text: string;
};

export type AboutMissionTemplate = {
  title: string;
  subtitle: string;
  cards: AboutMissionCardTemplate[];
};

export type AboutValueItemTemplate = {
  icon: string;
  title: string;
  description: string;
};

export type AboutValuesTemplate = {
  title: string;
  subtitle: string;
  items: AboutValueItemTemplate[];
};

export type AboutWhyChooseItemTemplate = {
  icon: string;
  title: string;
  description: string;
};

export type AboutWhyChooseTemplate = {
  title: string;
  image: string;
  image_alt: string;
  items: AboutWhyChooseItemTemplate[];
};

export type AboutTeamMemberTemplate = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type AboutTeamTemplate = {
  title: string;
  subtitle: string;
  members: AboutTeamMemberTemplate[];
};

export type AboutCTATemplate = {
  title: string;
  subtitle: string;
  primary_cta: TemplateCTA;
  secondary_cta: TemplateCTA;
};

export type AboutPageTemplatePayload = {
  hero?: AboutHeroTemplate;
  stats?: AboutStatTemplate[];
  story?: AboutStoryTemplate;
  mission?: AboutMissionTemplate;
  values?: AboutValuesTemplate;
  why_choose_us?: AboutWhyChooseTemplate;
  team?: AboutTeamTemplate;
  cta?: AboutCTATemplate;
};

export type MissionHighlightTemplate = {
  label: string;
  value: string;
};

export type MissionHeroTemplate = {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  image_alt: string;
  floating_note_top: string;
  floating_note_bottom: string;
  primary_cta: TemplateCTA;
  secondary_cta: TemplateCTA;
  highlights: MissionHighlightTemplate[];
};

export type MissionStoryTemplate = {
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
  quote_text: string;
  quote_caption: string;
};

export type MissionPillarTemplate = {
  eyebrow: string;
  title: string;
  description: string;
};

export type MissionPillarsSectionTemplate = {
  kicker: string;
  title: string;
  pillars: MissionPillarTemplate[];
};

export type MissionSupportStepTemplate = {
  step: string;
  title: string;
  description: string;
};

export type MissionSupportSectionTemplate = {
  kicker: string;
  title: string;
  steps: MissionSupportStepTemplate[];
};

export type MissionVisionTemplate = {
  kicker: string;
  title: string;
  description: string;
};

export type MissionImpactTemplate = {
  kicker: string;
  title: string;
  goals: string[];
};

export type OurMissionTemplatePayload = {
  hero?: MissionHeroTemplate;
  story?: MissionStoryTemplate;
  pillars_section?: MissionPillarsSectionTemplate;
  support_section?: MissionSupportSectionTemplate;
  vision?: MissionVisionTemplate;
  impact?: MissionImpactTemplate;
};

