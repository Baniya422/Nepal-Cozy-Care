import { beforeEach, describe, expect, it } from "vitest";
import { applyPlantFinderTemplate } from "./data";
import type { Plant, PlantFinderTemplatePayload } from "./types";
import {
  extractPlantsFromResponse,
  getCurrentPreview,
  getCurrentSelectionValue,
  getPlantFinderResults,
  normalizePlants,
} from "./utils";

const templateFixture: PlantFinderTemplatePayload = {
  light_map: {
    "bright-light": "Bright indirect light",
    "medium-light": "Medium light",
  },
  difficulty_map: {
    beginner: "Easy",
    intermediate: "Moderate",
  },
  humidity_map: {
    normal: "Normal humidity",
    humid: "High humidity",
  },
  room_map: {
    bedroom: "Bedroom",
    "living-room": "Living Room",
  },
  non_plant_categories: ["pots", "accessories", "tools"],
  preview_data: {
    room: {
      "": {
        eyebrow: "Room",
        title: "Select your room",
        description: "Choose where your plant will live.",
        image: "room-default.png",
      },
      bedroom: {
        eyebrow: "Bedroom",
        title: "Bedroom-friendly picks",
        description: "Low stress varieties for bedrooms.",
        image: "bedroom.png",
      },
    },
    light: {},
    experience: {},
    location: {},
  },
};

const plantsFixture: Plant[] = [
  {
    id: 1,
    name: "Spider Plant",
    price: "799",
    category: "plants",
    light: "Bright indirect light",
    difficulty: "Easy",
    humidity: "Normal humidity",
    rooms: ["Bedroom", "Living Room"],
  },
  {
    id: 2,
    name: "Snake Plant",
    price: 999,
    category: "plants",
    light: "Medium light",
    difficulty: "Easy",
    humidity: "Normal humidity",
    rooms: "Bedroom",
  },
  {
    id: 3,
    name: "Areca Palm",
    price: 1499,
    category: "plants",
    light: "Bright indirect light",
    difficulty: "Moderate",
    humidity: "High humidity",
    rooms: "Living Room",
  },
  {
    id: 4,
    name: "Decor Pot",
    price: 599,
    category: "pots",
    light: "Bright indirect light",
    difficulty: "Easy",
    humidity: "Normal humidity",
    rooms: "Bedroom",
  },
];

describe("plant-finder/utils", () => {
  beforeEach(() => {
    applyPlantFinderTemplate(templateFixture);
  });

  it("normalizes price values and extracts from API payload variants", () => {
    const normalized = normalizePlants(plantsFixture);
    expect(normalized[0].price).toBe(799);
    expect(normalized[1].price).toBe(999);

    const fromDataPlants = extractPlantsFromResponse({ data: { plants: [plantsFixture[0]] } });
    const fromDataData = extractPlantsFromResponse({ data: { data: [plantsFixture[1]] } });
    const fromDataRoot = extractPlantsFromResponse({ data: [plantsFixture[2]] });
    const fromInvalid = extractPlantsFromResponse({ data: { plants: "invalid" } });

    expect(fromDataPlants).toHaveLength(1);
    expect(fromDataData[0].name).toBe("Snake Plant");
    expect(fromDataRoot[0].name).toBe("Areca Palm");
    expect(fromInvalid).toEqual([]);
  });

  it("returns active selection values and preview fallbacks", () => {
    const selections = {
      room: "bedroom",
      light: "bright-light",
      experience: "beginner",
      location: "normal",
    } as const;

    expect(getCurrentSelectionValue("room", selections)).toBe("bedroom");
    expect(getCurrentSelectionValue("light", selections)).toBe("bright-light");
    expect(getCurrentSelectionValue("experience", selections)).toBe("beginner");
    expect(getCurrentSelectionValue("location", selections)).toBe("normal");

    const roomPreview = getCurrentPreview("room", selections);
    expect(roomPreview.title).toBe("Bedroom-friendly picks");

    const lightPreviewFallback = getCurrentPreview("light", selections);
    expect(lightPreviewFallback.title).toBe("Template Loaded");
  });

  it("returns recommended plants and additional plants while excluding non-plant categories", () => {
    const result = getPlantFinderResults(plantsFixture, {
      room: "bedroom",
      light: "bright-light",
      experience: "beginner",
      location: "normal",
    });

    expect(result.recommendedPlants.map((plant) => plant.id)).toEqual([1]);
    expect(result.morePlants.map((plant) => plant.id)).toEqual([2, 3]);
  });

  it("returns fallback list when no plants match current filters", () => {
    const result = getPlantFinderResults(plantsFixture, {
      room: "balcony",
      light: "low-light",
      experience: "expert",
      location: "dry",
    });

    expect(result.recommendedPlants).toEqual([]);
    expect(result.morePlants.map((plant) => plant.id)).toEqual([1, 2, 3]);
  });
});
