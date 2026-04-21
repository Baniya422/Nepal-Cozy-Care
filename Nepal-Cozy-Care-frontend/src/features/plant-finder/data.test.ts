import { describe, expect, it } from "vitest";
import {
  applyPlantFinderTemplate,
  difficultyMap,
  experienceOptions,
  humidityMap,
  lightMap,
  lightOptions,
  locationOptions,
  nonPlantCategories,
  previewData,
  roomMap,
  roomOptions,
} from "./data";
import type { PlantFinderTemplatePayload } from "./types";

const templateFixture: PlantFinderTemplatePayload = {
  room_options: [{ value: "bedroom", label: "Bedroom" }],
  light_options: [{ value: "bright-light", label: "Bright Light" }],
  experience_options: [{ value: "beginner", label: "Beginner" }],
  location_options: [{ value: "normal", label: "Normal Humidity" }],
  light_map: {
    "bright-light": "Bright indirect light",
  },
  difficulty_map: {
    beginner: "Easy",
  },
  humidity_map: {
    normal: "Normal humidity",
  },
  room_map: {
    bedroom: "Bedroom",
  },
  non_plant_categories: ["pots", "accessories"],
  preview_data: {
    room: {
      "": {
        eyebrow: "Room",
        title: "Choose a room",
        description: "Pick where the plant will stay.",
        image: "room-default.png",
      },
      bedroom: {
        eyebrow: "Bedroom",
        title: "Calm bedroom plants",
        description: "Relaxed choices for bedroom corners.",
        image: "bedroom.png",
      },
    },
    light: {},
    experience: {},
    location: {},
  },
};

describe("plant-finder/data", () => {
  it("applies template fields into runtime state", () => {
    applyPlantFinderTemplate(templateFixture);

    expect(roomOptions).toEqual([{ value: "bedroom", label: "Bedroom" }]);
    expect(lightOptions).toEqual([{ value: "bright-light", label: "Bright Light" }]);
    expect(experienceOptions).toEqual([{ value: "beginner", label: "Beginner" }]);
    expect(locationOptions).toEqual([{ value: "normal", label: "Normal Humidity" }]);

    expect(lightMap).toEqual({ "bright-light": "Bright indirect light" });
    expect(difficultyMap).toEqual({ beginner: "Easy" });
    expect(humidityMap).toEqual({ normal: "Normal humidity" });
    expect(roomMap).toEqual({ bedroom: "Bedroom" });
    expect(nonPlantCategories).toEqual(["pots", "accessories"]);
    expect(previewData.room.bedroom?.title).toBe("Calm bedroom plants");
  });

  it("resets state to defaults when template is missing", () => {
    applyPlantFinderTemplate(templateFixture);
    applyPlantFinderTemplate(null);

    expect(roomOptions).toEqual([]);
    expect(lightOptions).toEqual([]);
    expect(experienceOptions).toEqual([]);
    expect(locationOptions).toEqual([]);
    expect(lightMap).toEqual({});
    expect(difficultyMap).toEqual({});
    expect(humidityMap).toEqual({});
    expect(roomMap).toEqual({});
    expect(nonPlantCategories).toEqual([]);
    expect(previewData).toEqual({
      room: {},
      light: {},
      experience: {},
      location: {},
    });
  });
});
