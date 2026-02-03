import type {
  ActiveField,
  ExperienceKey,
  FinderOption,
  LightKey,
  LocationKey,
  PreviewContent,
  RoomKey,
} from "./types";

export const roomOptions: FinderOption<RoomKey>[] = [
  { value: "bedroom", label: "Bedroom" },
  { value: "living-room", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "balcony", label: "Balcony" },
];

export const lightOptions: FinderOption<LightKey>[] = [
  { value: "bright-light", label: "Bright Light" },
  { value: "medium-light", label: "Medium Light" },
  { value: "low-light", label: "Low Light" },
  { value: "indirect-light", label: "Indirect Light" },
];

export const experienceOptions: FinderOption<ExperienceKey>[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export const locationOptions: FinderOption<LocationKey>[] = [
  { value: "dry", label: "it's usually dry" },
  { value: "humid", label: "it's usually humid" },
  { value: "normal", label: "it's normal humidity" },
];

export const lightMap: Record<Exclude<LightKey, "">, string> = {
  "bright-light": "Bright Light",
  "medium-light": "Medium Light",
  "low-light": "Low Light",
  "indirect-light": "Indirect Light",
};

export const difficultyMap: Record<Exclude<ExperienceKey, "">, string> = {
  beginner: "Easy",
  intermediate: "Medium",
  expert: "Hard",
};

export const humidityMap: Record<Exclude<LocationKey, "">, string> = {
  dry: "Dry",
  humid: "Humid",
  normal: "Normal",
};

export const roomMap: Record<Exclude<RoomKey, "">, string> = {
  bedroom: "Bedroom",
  "living-room": "Living Room",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  office: "Office",
  balcony: "Balcony",
};

export const nonPlantCategories = [
  "Pots",
  "Tools",
  "Soil",
  "Fertilizers",
  "Accessories",
];

export const previewData: Record<ActiveField, Record<string, PreviewContent>> = {
  room: {
    "": {
      eyebrow: "Pick the room first",
      title: "Preview your plant's new home",
      description:
        "Selecting a room updates this panel so the quiz feels guided instead of empty.",
      image: "default.png",
    },
    bedroom: {
      eyebrow: "Quiet and restful",
      title: "Bedroom setup",
      description:
        "Soft corners, calmer light, and low-fuss greenery usually work best here.",
      image: "bedroom.png",
    },
    "living-room": {
      eyebrow: "Open and social",
      title: "Living room setup",
      description:
        "This space can support larger statement plants, especially near filtered light.",
      image: "living-room.png",
    },
    kitchen: {
      eyebrow: "Warm and practical",
      title: "Kitchen setup",
      description:
        "Choose plants that can handle brighter pockets, routine, and a little daily activity.",
      image: "kitchen.png",
    },
    bathroom: {
      eyebrow: "Moisture-friendly",
      title: "Bathroom setup",
      description:
        "Humidity-loving plants usually feel more at home in this kind of environment.",
      image: "bathroom.png",
    },
    office: {
      eyebrow: "Focused and tidy",
      title: "Office setup",
      description:
        "Structured plants that stay neat and tolerate routine placement fit well here.",
      image: "office.png",
    },
    balcony: {
      eyebrow: "Airy and bright",
      title: "Balcony setup",
      description:
        "This is the best match for sun-ready plants that enjoy stronger exposure and airflow.",
      image: "balcony.png",
    },
  },
  light: {
    "": {
      eyebrow: "Check the windows",
      title: "Light levels",
      description: "How much natural sunlight does this particular spot receive?",
      image: "default.png",
    },
    "bright-light": {
      eyebrow: "Sun-drenched",
      title: "Bright Light",
      description:
        "Direct sunlight for most of the day. Perfect for sun-loving plants and cacti.",
      image: "bright-light.png",
    },
    "medium-light": {
      eyebrow: "Balanced",
      title: "Medium Light",
      description:
        "A few hours of direct sun or bright filtered light throughout the day.",
      image: "medium-light.png",
    },
    "low-light": {
      eyebrow: "Shady",
      title: "Low Light",
      description:
        "Little to no direct sunlight. Great for hardy, adaptable plants.",
      image: "low-light.png",
    },
    "indirect-light": {
      eyebrow: "Gentle rays",
      title: "Indirect Light",
      description:
        "Bright light that is filtered or bounced, avoiding harsh direct sun.",
      image: "indirect-light.png",
    },
  },
  experience: {
    "": {
      eyebrow: "Your comfort zone",
      title: "Experience level",
      description: "How confident are you with keeping plants alive?",
      image: "default.png",
    },
    beginner: {
      eyebrow: "Just starting",
      title: "Beginner Plant Parent",
      description:
        "Low-maintenance plants that are forgiving if you forget a watering or two.",
      image: "beginner.png",
    },
    intermediate: {
      eyebrow: "Getting the hang of it",
      title: "Intermediate",
      description:
        "You know the basics and are ready for plants with a few specific needs.",
      image: "intermediate.png",
    },
    expert: {
      eyebrow: "Green thumb",
      title: "Plant Expert",
      description:
        "You're ready for high-maintenance, rare, or fuzzy beauties.",
      image: "expert.png",
    },
  },
  location: {
    "": {
      eyebrow: "Air quality",
      title: "Home Humidity",
      description: "What is the moisture level like in your home?",
      image: "default.png",
    },
    dry: {
      eyebrow: "Crisp air",
      title: "Usually dry",
      description:
        "Great for succulents, cacti, and plants that don't need misting.",
      image: "dry.png",
    },
    humid: {
      eyebrow: "Tropical feel",
      title: "Usually humid",
      description:
        "Perfect for ferns, calatheas, and other moisture-loving tropicals.",
      image: "humid.png",
    },
    normal: {
      eyebrow: "Standard indoor",
      title: "Normal humidity",
      description:
        "Balanced environment where most common houseplants will thrive.",
      image: "normal.png",
    },
  },
};
