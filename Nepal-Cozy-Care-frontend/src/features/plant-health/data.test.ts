import { Bug, Leaf, Sun } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPlantHealthTemplate,
  diagnosisProfiles,
  environmentOptions,
  getCurrentSeason,
  healthyPlantHabits,
  plantTypeOptions,
  seasonOptions,
  soilOptions,
  symptomCategories,
} from "./data";
import type { PlantHealthTemplatePayload } from "./types";

const templateFixture: PlantHealthTemplatePayload = {
  symptom_categories: [
    {
      id: "leaf_signals",
      name: "Leaf Signals",
      icon: "Bug",
      symptoms: [
        {
          id: "yellow_leaves",
          name: "Yellowing Leaves",
          description: "Leaves are becoming pale or yellow.",
        },
      ],
    },
    {
      id: "soil_signals",
      name: "Soil Signals",
      icon: "UnknownIcon",
      symptoms: [
        {
          id: "dry_soil",
          name: "Dry Soil",
          description: "Soil dries too quickly.",
        },
      ],
    },
  ],
  plant_type_options: [{ id: "indoor", label: "Indoor Plant" }],
  environment_options: [{ id: "living_room", label: "Living Room" }],
  season_options: [{ id: "spring", label: "Spring" }],
  soil_options: [{ id: "wet", label: "Wet Soil" }],
  diagnosis_profiles: [
    {
      id: "overwatering",
      title: "Overwatering",
      summary: "Too much water around roots.",
      severity: "high",
      symptoms: ["yellow_leaves"],
      immediateActions: ["Pause watering"],
      causes: ["Watering too frequently"],
      solutions: ["Allow soil to dry"],
      prevention: ["Check moisture first"],
      relatedCareTips: ["watering-basics"],
    },
  ],
  default_diagnosis: {
    id: "unknown_issue",
    title: "Unknown Issue",
    summary: "No clear diagnosis found.",
    severity: "low",
    symptoms: [],
    immediateActions: ["Observe for 48 hours"],
    causes: ["Insufficient data"],
    solutions: ["Collect more signs"],
    prevention: ["Routine checks"],
    relatedCareTips: ["plant-observation"],
  },
  healthy_plant_habits: [
    {
      title: "Morning Sun Check",
      description: "Rotate plant for even light.",
      icon: "Sun",
    },
    {
      title: "Weekly Inspection",
      description: "Inspect leaf undersides for pests.",
      icon: "NotMapped",
    },
  ],
};

describe("plant-health/data", () => {
  beforeEach(() => {
    applyPlantHealthTemplate(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("maps template fields and icon fallbacks into runtime data", () => {
    applyPlantHealthTemplate(templateFixture);

    expect(symptomCategories).toHaveLength(2);
    expect(symptomCategories[0].icon).toBe(Bug);
    expect(symptomCategories[1].icon).toBe(Leaf);

    expect(plantTypeOptions).toEqual([{ id: "indoor", label: "Indoor Plant" }]);
    expect(environmentOptions).toEqual([{ id: "living_room", label: "Living Room" }]);
    expect(seasonOptions).toEqual([{ id: "spring", label: "Spring" }]);
    expect(soilOptions).toEqual([{ id: "wet", label: "Wet Soil" }]);
    expect(diagnosisProfiles).toHaveLength(1);

    expect(healthyPlantHabits).toHaveLength(2);
    expect(healthyPlantHabits[0].icon).toBe(Sun);
    expect(healthyPlantHabits[1].icon).toBe(Leaf);
  });

  it("clears runtime collections when no template is provided", () => {
    applyPlantHealthTemplate(templateFixture);
    applyPlantHealthTemplate(undefined);

    expect(symptomCategories).toEqual([]);
    expect(plantTypeOptions).toEqual([]);
    expect(environmentOptions).toEqual([]);
    expect(soilOptions).toEqual([]);
    expect(seasonOptions).toEqual([]);
    expect(diagnosisProfiles).toEqual([]);
    expect(healthyPlantHabits).toEqual([]);
  });

  it("returns season ids based on month boundaries", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-04-15T08:00:00.000Z"));
    expect(getCurrentSeason()).toBe("spring");

    vi.setSystemTime(new Date("2026-06-15T08:00:00.000Z"));
    expect(getCurrentSeason()).toBe("summer");

    vi.setSystemTime(new Date("2026-08-15T08:00:00.000Z"));
    expect(getCurrentSeason()).toBe("monsoon");

    vi.setSystemTime(new Date("2026-10-15T08:00:00.000Z"));
    expect(getCurrentSeason()).toBe("autumn");

    vi.setSystemTime(new Date("2026-12-15T08:00:00.000Z"));
    expect(getCurrentSeason()).toBe("winter");
  });
});
