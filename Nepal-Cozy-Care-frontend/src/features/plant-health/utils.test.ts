import { beforeEach, describe, expect, it } from "vitest";
import { applyPlantHealthTemplate } from "./data";
import type { PlantHealthTemplatePayload } from "./types";
import {
  analyzePlantHealth,
  getActionWindow,
  getOptionLabel,
  getProgressValue,
  getSeverityColor,
  getSymptomName,
  titleCase,
} from "./utils";

const templateFixture: PlantHealthTemplatePayload = {
  symptom_categories: [
    {
      id: "leaf_signals",
      name: "Leaf Signals",
      icon: "Leaf",
      symptoms: [
        {
          id: "yellow_leaves",
          name: "Yellowing Leaves",
          description: "Leaves become yellow.",
        },
        {
          id: "drooping",
          name: "Drooping Leaves",
          description: "Leaves droop and look weak.",
        },
        {
          id: "brown_spots",
          name: "Brown Spots",
          description: "Leaf spots appear.",
        },
      ],
    },
  ],
  plant_type_options: [{ id: "indoor", label: "Indoor Plant" }],
  environment_options: [{ id: "living_room", label: "Living Room" }],
  season_options: [{ id: "monsoon", label: "Monsoon" }],
  soil_options: [{ id: "wet", label: "Wet Soil" }],
  diagnosis_profiles: [
    {
      id: "overwatering",
      title: "Overwatering Stress",
      summary: "Root zone remains waterlogged.",
      severity: "high",
      symptoms: ["yellow_leaves", "drooping"],
      immediateActions: ["Pause watering for two days"],
      causes: ["Overwatering"],
      solutions: ["Improve drainage"],
      prevention: ["Check soil before watering"],
      relatedCareTips: ["watering-routine"],
      contextBoosts: {
        plantTypes: ["indoor"],
        soilStates: ["wet"],
      },
    },
    {
      id: "leaf_spot",
      title: "Fungal Leaf Spot",
      summary: "Spots appear in humid conditions.",
      severity: "medium",
      symptoms: ["drooping", "brown_spots"],
      immediateActions: ["Trim affected leaves"],
      causes: ["Poor airflow"],
      solutions: ["Increase ventilation"],
      prevention: ["Avoid wet leaves overnight"],
      relatedCareTips: ["air-circulation"],
      contextBoosts: {
        seasons: ["monsoon"],
      },
    },
    {
      id: "light_stress",
      title: "Light Stress",
      summary: "Plant does not receive consistent light.",
      severity: "low",
      symptoms: ["drooping"],
      immediateActions: ["Move near brighter window"],
      causes: ["Low light"],
      solutions: ["Increase daily light"],
      prevention: ["Rotate weekly"],
      relatedCareTips: ["light-basics"],
    },
  ],
  default_diagnosis: {
    id: "fallback",
    title: "No clear match",
    summary: "Need more observations.",
    severity: "medium",
    symptoms: [],
    immediateActions: ["Observe for 2-3 days"],
    causes: ["Insufficient clues"],
    solutions: ["Track watering and lighting"],
    prevention: ["Regular checkups"],
    relatedCareTips: ["plant-journal"],
  },
  healthy_plant_habits: [],
};

describe("plant-health/utils", () => {
  beforeEach(() => {
    applyPlantHealthTemplate(templateFixture);
  });

  it("formats snake_case strings and unknown ids", () => {
    expect(titleCase("yellow_leaves")).toBe("Yellow Leaves");
    expect(getSymptomName("yellow_leaves")).toBe("Yellowing Leaves");
    expect(getSymptomName("root_rot_warning")).toBe("Root Rot Warning");
  });

  it("returns option labels with title-case fallback", () => {
    const items = [{ id: "living_room", label: "Living Room" }];

    expect(getOptionLabel(items, "living_room")).toBe("Living Room");
    expect(getOptionLabel(items, "bright_balcony")).toBe("Bright Balcony");
  });

  it("maps severity to action windows and CSS color tokens", () => {
    expect(getActionWindow("high")).toBe("Take action today");
    expect(getActionWindow("medium")).toBe("Adjust care within 24-48 hours");
    expect(getActionWindow("low")).toBe("Monitor and improve routine");

    expect(getSeverityColor("high")).toBe("severity-high");
    expect(getSeverityColor("medium")).toBe("severity-medium");
    expect(getSeverityColor("low")).toBe("severity-low");
  });

  it("calculates progress and caps at 100", () => {
    expect(getProgressValue([], "unknown")).toBe(18);
    expect(getProgressValue(["yellow_leaves", "drooping"], "wet")).toBe(54);
    expect(getProgressValue(new Array(10).fill("symptom"), "dry")).toBe(100);
  });

  it("scores diagnoses and returns primary plus relevant alternatives", () => {
    const analysis = analyzePlantHealth({
      selectedSymptoms: ["yellow_leaves", "drooping", "brown_spots"],
      plantType: "indoor",
      environment: "living_room",
      season: "monsoon",
      soilState: "wet",
    });

    expect(analysis.primary.id).toBe("overwatering");
    expect(analysis.primary.matchedSymptoms).toEqual(["yellow_leaves", "drooping"]);
    expect(analysis.primary.score).toBeGreaterThan(analysis.alternatives[0].score);
    expect(analysis.alternatives.map((item) => item.id)).toContain("leaf_spot");
  });

  it("keeps only the two closest alternatives above the score cutoff", () => {
    const diagnosisProfiles = templateFixture.diagnosis_profiles ?? [];

    applyPlantHealthTemplate({
      ...templateFixture,
      diagnosis_profiles: [
        ...diagnosisProfiles,
        {
          id: "humidity_stress",
          title: "Humidity Stress",
          summary: "High humidity keeps foliage damp.",
          severity: "medium",
          symptoms: ["yellow_leaves", "brown_spots"],
          immediateActions: ["Increase airflow"],
          causes: ["Excess humidity"],
          solutions: ["Run a fan"],
          prevention: ["Improve ventilation"],
          relatedCareTips: ["humidity-control"],
          contextBoosts: {
            plantTypes: ["indoor"],
            seasons: ["monsoon"],
          },
        },
        {
          id: "light_deficit",
          title: "Light Deficit",
          summary: "Leaves slow down without enough light.",
          severity: "low",
          symptoms: ["yellow_leaves", "drooping"],
          immediateActions: ["Move closer to a window"],
          causes: ["Insufficient light"],
          solutions: ["Increase daily exposure"],
          prevention: ["Rotate the pot weekly"],
          relatedCareTips: ["light-basics"],
          contextBoosts: {
            plantTypes: ["indoor"],
          },
        },
        {
          id: "airflow_issue",
          title: "Airflow Issue",
          summary: "Stagnant air increases stress.",
          severity: "medium",
          symptoms: ["drooping", "brown_spots"],
          immediateActions: ["Open a nearby window"],
          causes: ["Poor ventilation"],
          solutions: ["Improve circulation"],
          prevention: ["Avoid crowding plants"],
          relatedCareTips: ["air-circulation"],
          contextBoosts: {
            seasons: ["monsoon"],
          },
        },
      ],
    });

    const analysis = analyzePlantHealth({
      selectedSymptoms: ["yellow_leaves", "drooping", "brown_spots"],
      plantType: "indoor",
      environment: "living_room",
      season: "monsoon",
      soilState: "wet",
    });

    expect(analysis.primary.id).toBe("overwatering");
    expect(analysis.alternatives).toHaveLength(2);
    expect(analysis.alternatives.map((item) => item.id)).toEqual([
      "humidity_stress",
      "light_deficit",
    ]);
  });

  it("falls back to default diagnosis when no profile receives a score", () => {
    const analysis = analyzePlantHealth({
      selectedSymptoms: ["mystery_signal"],
      plantType: "outdoor",
      environment: "balcony",
      season: "winter",
      soilState: "unknown",
    });

    expect(analysis.primary.id).toBe("fallback");
    expect(analysis.primary.score).toBe(1);
    expect(analysis.primary.confidence).toBe(45);
    expect(analysis.primary.matchedSymptoms).toEqual(["mystery_signal"]);
    expect(analysis.alternatives).toEqual([]);
  });
});
