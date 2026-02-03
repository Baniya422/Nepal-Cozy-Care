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

const roomMatches = (plantRooms: Plant["rooms"], roomValue: string) => {
  if (!plantRooms) return false;

  if (Array.isArray(plantRooms)) {
    return plantRooms.includes(roomValue);
  }

  return plantRooms === roomValue;
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
  return previewData[activeField][currentSelection] || previewData[activeField][""];
};

export const getPlantFinderResults = (
  allPlants: Plant[],
  selections: PlantFinderSelections
): PlantFinderResults => {
  const filteredPlants = allPlants.filter((plant) => {
    if (plant.category && nonPlantCategories.includes(plant.category)) {
      return false;
    }

    if (selections.light && plant.light) {
      if (plant.light !== lightMap[selections.light]) {
        return false;
      }
    }

    if (selections.experience && plant.difficulty) {
      if (plant.difficulty !== difficultyMap[selections.experience]) {
        return false;
      }
    }

    if (selections.location && plant.humidity) {
      if (plant.humidity !== humidityMap[selections.location]) {
        return false;
      }
    }

    if (selections.room) {
      const roomValue = roomMap[selections.room];
      if (!roomMatches(plant.rooms, roomValue)) {
        return false;
      }
    }

    return true;
  });

  const plantOnlyFallback = allPlants.filter(
    (plant) => !plant.category || !nonPlantCategories.includes(plant.category)
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
    recommendedPlants: filteredPlants.slice(0, 3),
    morePlants: remainingPlants.slice(0, 6),
  };
};
