import type {
  ExperienceKey,
  FinderOption,
  LightKey,
  LocationKey,
  PlantFinderPreviewData,
  PlantFinderTemplatePayload,
  RoomKey,
} from "./types";
export const DEFAULT_ROOM_OPTIONS: FinderOption<RoomKey>[] = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "office", label: "Home Office" },
  { value: "balcony", label: "Balcony / Patio" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
];

export const DEFAULT_LIGHT_OPTIONS: FinderOption<LightKey>[] = [
  { value: "bright-light", label: "Direct / Bright Sunlight" },
  { value: "medium-light", label: "Medium / Filtered Light" },
  { value: "indirect-light", label: "Bright Indirect Light" },
  { value: "low-light", label: "Low Light / Shaded Corner" },
];

export const DEFAULT_EXPERIENCE_OPTIONS: FinderOption<ExperienceKey>[] = [
  { value: "beginner", label: "Beginner Friendly (Hard to kill)" },
  { value: "intermediate", label: "Intermediate (Moderate care)" },
  { value: "expert", label: "Plant Enthusiast (Detailed care)" },
];

export const DEFAULT_LOCATION_OPTIONS: FinderOption<LocationKey>[] = [
  { value: "dry", label: "Dry (Air conditioned / Heated)" },
  { value: "normal", label: "Normal (Moderate humidity)" },
  { value: "humid", label: "Humid (Moisture rich / Misted)" },
];

export const DEFAULT_PREVIEW_DATA: PlantFinderPreviewData = {
  room: {
    "": {
      eyebrow: "Space Visualization",
      title: "Choose Your Room",
      description: "Select where you want to place your new botanical plants.",
      image: "living-room.png",
    },
    "living-room": {
      eyebrow: "Living Room Setup",
      title: "Lush Social Space",
      description: "Statement floor plants and architectural foliage complement sofa seating.",
      image: "living-room.png",
    },
    bedroom: {
      eyebrow: "Bedroom Sanctuary",
      title: "Calm & Restful",
      description: "Air-purifying, low-maintenance greens designed for peaceful relaxation.",
      image: "bedroom.png",
    },
    office: {
      eyebrow: "Productive Workspace",
      title: "Focused & Energizing",
      description: "Compact desk companions and air-cleaning plants to boost productivity.",
      image: "office.png",
    },
    balcony: {
      eyebrow: "Outdoor Balcony",
      title: "Sun-Loving Garden",
      description: "Thriving outdoor greenery, resilient palms, and flowering planters.",
      image: "balcony.png",
    },
    kitchen: {
      eyebrow: "Culinary Space",
      title: "Bright & Compact",
      description: "Compact succulents, herbs, and resilient countertop greenery.",
      image: "kitchen.png",
    },
    bathroom: {
      eyebrow: "Spa Oasis",
      title: "High Humidity Retreat",
      description: "Tropical ferns and moisture-loving foliage that thrive in shower steam.",
      image: "bathroom.png",
    },
  },
  light: {
    "": {
      eyebrow: "Sunlight Exposure",
      title: "Lighting Conditions",
      description: "Pick the natural light level your room receives throughout the day.",
      image: "living-room.png",
    },
    "bright-light": {
      eyebrow: "Sunlit Space",
      title: "Direct Sunlight",
      description: "Ideal for sun worshippers, succulents, palms, and hearty tropicals.",
      image: "living-room.png",
    },
    "medium-light": {
      eyebrow: "Filtered Sunlight",
      title: "Gentle Daylight",
      description: "Versatile light level suitable for most tropical houseplants.",
      image: "living-room.png",
    },
    "indirect-light": {
      eyebrow: "Diffused Lighting",
      title: "Bright Indirect Light",
      description: "Soft ambient daylight near east or north-facing windows.",
      image: "living-room.png",
    },
    "low-light": {
      eyebrow: "Shaded Corner",
      title: "Low Light",
      description: "Tough, shade-tolerant greens like Snake Plants and ZZ Plants.",
      image: "bedroom.png",
    },
  },
  experience: {
    "": {
      eyebrow: "Care Level",
      title: "Plant Parenting",
      description: "Select how much time and care routine you want to invest.",
      image: "living-room.png",
    },
    beginner: {
      eyebrow: "Easy Care",
      title: "Beginner Friendly",
      description: "Forgiving plants that tolerate missed waterings and imperfect conditions.",
      image: "living-room.png",
    },
    intermediate: {
      eyebrow: "Moderate Routine",
      title: "Balanced Care",
      description: "Plants needing regular watering cycles and seasonal fertilizing.",
      image: "living-room.png",
    },
    expert: {
      eyebrow: "Enthusiast Collection",
      title: "Exotic & Detailed Care",
      description: "Finicky tropicals requiring precise humidity and light balance.",
      image: "living-room.png",
    },
  },
  location: {
    "": {
      eyebrow: "Microclimate",
      title: "Humidity & Moisture",
      description: "Select the ambient humidity of your room.",
      image: "living-room.png",
    },
    dry: {
      eyebrow: "Low Humidity",
      title: "Dry Environment",
      description: "Drought-tolerant plants that do well in air-conditioned spaces.",
      image: "office.png",
    },
    normal: {
      eyebrow: "Moderate Humidity",
      title: "Balanced Air",
      description: "Standard indoor humidity suitable for most household varieties.",
      image: "living-room.png",
    },
    humid: {
      eyebrow: "High Humidity",
      title: "Tropical Moisture",
      description: "Lush jungle plants that love humidity and misting.",
      image: "bathroom.png",
    },
  },
};

export let roomOptions: FinderOption<RoomKey>[] = DEFAULT_ROOM_OPTIONS;
export let lightOptions: FinderOption<LightKey>[] = DEFAULT_LIGHT_OPTIONS;
export let experienceOptions: FinderOption<ExperienceKey>[] = DEFAULT_EXPERIENCE_OPTIONS;
export let locationOptions: FinderOption<LocationKey>[] = DEFAULT_LOCATION_OPTIONS;
export let lightMap: Record<string, string> = {};
export let difficultyMap: Record<string, string> = {};
export let humidityMap: Record<string, string> = {};
export let roomMap: Record<string, string> = {};
export let nonPlantCategories: string[] = [];
export let previewData: PlantFinderPreviewData = DEFAULT_PREVIEW_DATA;

export const applyPlantFinderTemplate = (template?: PlantFinderTemplatePayload | null) => {
  roomOptions = Array.isArray(template?.room_options) && template.room_options.length > 0
    ? template.room_options
    : DEFAULT_ROOM_OPTIONS;
  lightOptions = Array.isArray(template?.light_options) && template.light_options.length > 0
    ? template.light_options
    : DEFAULT_LIGHT_OPTIONS;
  experienceOptions = Array.isArray(template?.experience_options) && template.experience_options.length > 0
    ? template.experience_options
    : DEFAULT_EXPERIENCE_OPTIONS;
  locationOptions = Array.isArray(template?.location_options) && template.location_options.length > 0
    ? template.location_options
    : DEFAULT_LOCATION_OPTIONS;
  lightMap = template?.light_map ?? {};
  difficultyMap = template?.difficulty_map ?? {};
  humidityMap = template?.humidity_map ?? {};
  roomMap = template?.room_map ?? {};
  nonPlantCategories = Array.isArray(template?.non_plant_categories)
    ? template.non_plant_categories
    : [];
  previewData = template?.preview_data ?? DEFAULT_PREVIEW_DATA;
};

export const DEFAULT_PLANT_CATALOG = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    category: "Indoor Plants",
    difficulty: "easy",
    light: "bright-indirect",
    rooms: ["living-room", "bedroom"],
    humidity: "60-80%",
    price: 1450,
    image: "/images/mos.jpg",
  },
  {
    id: 2,
    name: "Snake Plant Laurentii",
    category: "Air Purifying",
    difficulty: "beginner",
    light: "low-light",
    rooms: ["bedroom", "office", "bathroom"],
    humidity: "30-50%",
    price: 850,
    image: "/images/snake.jpg",
  },
  {
    id: 3,
    name: "Rubber Tree Burgundy",
    category: "Indoor Plants",
    difficulty: "easy",
    light: "bright-indirect",
    rooms: ["living-room", "office"],
    humidity: "50-70%",
    price: 1200,
    image: "/images/rubber.jpg",
  },
  {
    id: 4,
    name: "Organic Aloe Vera",
    category: "Succulents",
    difficulty: "beginner",
    light: "direct-sun",
    rooms: ["kitchen", "balcony"],
    humidity: "20-40%",
    price: 450,
    image: "/images/alovera.jpg",
  },
  {
    id: 5,
    name: "Peace Lily Sensation",
    category: "Flowering",
    difficulty: "easy",
    light: "medium-indirect",
    rooms: ["bedroom", "bathroom"],
    humidity: "60-80%",
    price: 950,
    image: "/images/lily.jpg",
  },
  {
    id: 6,
    name: "Variegated Spider Plant",
    category: "Air Purifying",
    difficulty: "beginner",
    light: "bright-indirect",
    rooms: ["living-room", "bedroom", "office"],
    humidity: "40-60%",
    price: 550,
    image: "/images/spider.jpg",
  },
  {
    id: 7,
    name: "Golden Pothos Devil's Ivy",
    category: "Air Purifying",
    difficulty: "beginner",
    light: "low-light",
    rooms: ["bedroom", "bathroom", "living-room", "office"],
    humidity: "50-80%",
    price: 600,
    image: "/images/pothos.jpg",
  },
  {
    id: 8,
    name: "Fiddle Leaf Fig Tree",
    category: "Indoor Plants",
    difficulty: "intermediate",
    light: "bright-indirect",
    rooms: ["living-room", "office"],
    humidity: "50-70%",
    price: 2200,
    image: "/images/fiddle.jpg",
  },
  {
    id: 9,
    name: "Areca Butterfly Palm",
    category: "Indoor Plants",
    difficulty: "easy",
    light: "bright-indirect",
    rooms: ["living-room", "balcony"],
    humidity: "55-75%",
    price: 1750,
    image: "/images/palm.jpg",
  },
  {
    id: 10,
    name: "ZZ Plant Fortune Gem",
    category: "Air Purifying",
    difficulty: "beginner",
    light: "low-light",
    rooms: ["bedroom", "office", "bathroom"],
    humidity: "30-60%",
    price: 950,
    image: "/images/zzplant.jpg",
  },
  {
    id: 11,
    name: "Lucky Jade Money Tree",
    category: "Succulents",
    difficulty: "beginner",
    light: "direct-sun",
    rooms: ["balcony", "kitchen", "office"],
    humidity: "20-45%",
    price: 550,
    image: "/images/jade.jpg",
  },
  {
    id: 12,
    name: "English Ivy Glacier",
    category: "Indoor Plants",
    difficulty: "easy",
    light: "medium-indirect",
    rooms: ["living-room", "bedroom", "bathroom"],
    humidity: "50-70%",
    price: 480,
    image: "/images/about-plants.jpg",
  },
  {
    id: 13,
    name: "Boston Sword Fern",
    category: "Indoor Plants",
    difficulty: "easy",
    light: "indirect-light",
    rooms: ["bathroom", "living-room", "balcony"],
    humidity: "65-85%",
    price: 750,
    image: "/images/winter-garden.png",
  },
];
