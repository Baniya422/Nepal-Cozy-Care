import {
  difficultyMap,
  humidityMap,
  lightMap,
  nonPlantCategories,
  previewData,
  roomMap,
} from "./data";
import type {
  ActiveField,
  Plant,
  PlantFinderResults,
  PlantFinderSelections,
  PreviewContent,
} from "./types";
const normalizeValue = (value: unknown) => String(value ?? "").trim().toLowerCase();
const roomMatches = (plantRooms: Plant["rooms"], roomValue: string) => {
  if (!plantRooms) return false;
  const normalizedRoomValue = normalizeValue(roomValue);
  if (Array.isArray(plantRooms)) {
    return plantRooms.some((room) => normalizeValue(room) === normalizedRoomValue);
  }
  return normalizeValue(plantRooms) === normalizedRoomValue;
};
export const normalizePlants = (plants: Plant[]): Plant[] =>
  plants.map((plant) => ({
    ...plant,
    price:
      typeof plant.price === "string"
        ? parseFloat(plant.price)
        : plant.price || 0,
  }));
export const extractPlantsFromResponse = (payload: any): Plant[] => {
  const rawPlants =
    payload?.data?.plants ?? payload?.data?.data ?? payload?.data ?? [];
  return normalizePlants(Array.isArray(rawPlants) ? rawPlants : []);
};
export const getCurrentSelectionValue = (
  activeField: ActiveField,
  selections: PlantFinderSelections
) => {
  switch (activeField) {
    case "room":
      return selections.room;
    case "light":
      return selections.light;
    case "experience":
      return selections.experience;
    case "location":
    default:
      return selections.location;
  }
};
export const getCurrentPreview = (
  activeField: ActiveField,
  selections: PlantFinderSelections
): PreviewContent => {
  const currentSelection = getCurrentSelectionValue(activeField, selections);
  const fieldPreview = previewData[activeField] ?? {};
  return (
    fieldPreview[currentSelection] ??
    fieldPreview[""] ?? {
      eyebrow: "Plant Finder",
      title: "Template Loaded",
      description: "Choose an option to see contextual preview.",
      image: "default.png",
    }
  );
};
const isLightCompatible = (plantLight?: string, selectionLight?: string) => {
  if (!selectionLight || !plantLight) return true;
  const p = normalizeValue(plantLight);
  const s = normalizeValue(selectionLight);
  if (p === s) return true;
  if (s === "bright-light" || s.includes("bright")) {
    return p.includes("bright") || p.includes("direct");
  }
  if (s === "medium-light" || s.includes("medium")) {
    return p.includes("medium") || p.includes("indirect") || p.includes("bright");
  }
  if (s === "low-light" || s.includes("low")) {
    return p.includes("low") || p.includes("medium");
  }
  if (s === "indirect-light" || s.includes("indirect")) {
    return p.includes("indirect") || p.includes("medium") || p.includes("bright");
  }
  return false;
};

const isDifficultyCompatible = (plantDifficulty?: string, selectionExp?: string) => {
  if (!selectionExp || !plantDifficulty) return true;
  const p = normalizeValue(plantDifficulty);
  const s = normalizeValue(selectionExp);
  if (p === s) return true;
  if (s === "beginner" || s === "easy") {
    return p === "easy" || p === "beginner";
  }
  if (s === "intermediate" || s === "medium" || s === "moderate") {
    return p === "intermediate" || p === "medium" || p === "moderate" || p === "easy" || p === "beginner";
  }
  if (s === "expert" || s === "hard" || s === "advanced") {
    return true;
  }
  return false;
};

const isHumidityCompatible = (plantHumidity?: string, selectionLocation?: string) => {
  if (!selectionLocation || !plantHumidity) return true;
  const p = normalizeValue(plantHumidity);
  const s = normalizeValue(selectionLocation);
  if (p === s) return true;
  if (s === "humid" || s.includes("humid")) {
    return p.includes("60") || p.includes("70") || p.includes("80") || p.includes("high") || p.includes("humid");
  }
  if (s === "dry" || s.includes("dry")) {
    return p.includes("20") || p.includes("30") || p.includes("40") || p.includes("dry") || p.includes("low");
  }
  if (s === "normal" || s.includes("normal")) {
    return true;
  }
  return false;
};

export const getPlantFinderResults = (
  allPlants: Plant[],
  selections: PlantFinderSelections
): PlantFinderResults => {
  const normalizedNonPlantCategories = new Set(
    nonPlantCategories.map((category) => normalizeValue(category))
  );
  const filteredPlants = allPlants.filter((plant) => {
    if (plant.category && normalizedNonPlantCategories.has(normalizeValue(plant.category))) {
      return false;
    }
    if (selections.light && plant.light) {
      const expectedLight = lightMap[selections.light] ?? selections.light;
      const exactMatch = normalizeValue(plant.light) === normalizeValue(expectedLight);
      const semanticMatch = isLightCompatible(plant.light, selections.light);
      if (!exactMatch && !semanticMatch) {
        return false;
      }
    }
    if (selections.experience && plant.difficulty) {
      const expectedDifficulty =
        difficultyMap[selections.experience] ?? selections.experience;
      const exactMatch = normalizeValue(plant.difficulty) === normalizeValue(expectedDifficulty);
      const semanticMatch = isDifficultyCompatible(plant.difficulty, selections.experience);
      if (!exactMatch && !semanticMatch) {
        return false;
      }
    }
    if (selections.location && plant.humidity) {
      const expectedHumidity = humidityMap[selections.location] ?? selections.location;
      const exactMatch = normalizeValue(plant.humidity) === normalizeValue(expectedHumidity);
      const semanticMatch = isHumidityCompatible(plant.humidity, selections.location);
      if (!exactMatch && !semanticMatch) {
        return false;
      }
    }
    if (selections.room) {
      const roomValue = roomMap[selections.room] ?? selections.room;
      if (!roomMatches(plant.rooms, roomValue)) {
        return false;
      }
    }
    return true;
  });
  const plantOnlyFallback = allPlants.filter(
    (plant) =>
      !plant.category || !normalizedNonPlantCategories.has(normalizeValue(plant.category))
  );
  if (filteredPlants.length === 0) {
    return {
      recommendedPlants: [],
      morePlants: plantOnlyFallback.slice(0, 6),
    };
  }
  const filteredIds = new Set(filteredPlants.map((plant) => plant.id));
  const remainingPlants = plantOnlyFallback.filter(
    (plant) => !filteredIds.has(plant.id)
  );
  return {
    recommendedPlants: filteredPlants.slice(0, 6),
    morePlants: remainingPlants.slice(0, 6),
  };
};
