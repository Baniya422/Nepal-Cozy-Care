import type {
  ExperienceKey,
  FinderOption,
  LightKey,
  LocationKey,
  PlantFinderPreviewData,
  PlantFinderTemplatePayload,
  RoomKey,
} from "./types";
const emptyPreviewData: PlantFinderPreviewData = {
  room: {},
  light: {},
  experience: {},
  location: {},
};
export let roomOptions: FinderOption<RoomKey>[] = [];
export let lightOptions: FinderOption<LightKey>[] = [];
export let experienceOptions: FinderOption<ExperienceKey>[] = [];
export let locationOptions: FinderOption<LocationKey>[] = [];
export let lightMap: Record<string, string> = {};
export let difficultyMap: Record<string, string> = {};
export let humidityMap: Record<string, string> = {};
export let roomMap: Record<string, string> = {};
export let nonPlantCategories: string[] = [];
export let previewData: PlantFinderPreviewData = emptyPreviewData;
export const applyPlantFinderTemplate = (template?: PlantFinderTemplatePayload | null) => {
  roomOptions = Array.isArray(template?.room_options) ? template.room_options : [];
  lightOptions = Array.isArray(template?.light_options) ? template.light_options : [];
  experienceOptions = Array.isArray(template?.experience_options)
    ? template.experience_options
    : [];
  locationOptions = Array.isArray(template?.location_options) ? template.location_options : [];
  lightMap = template?.light_map ?? {};
  difficultyMap = template?.difficulty_map ?? {};
  humidityMap = template?.humidity_map ?? {};
  roomMap = template?.room_map ?? {};
  nonPlantCategories = Array.isArray(template?.non_plant_categories)
    ? template.non_plant_categories
    : [];
  previewData = template?.preview_data ?? emptyPreviewData;
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
