import { describe, expect, it } from "vitest";
import { getAIPlantRecommendations, calculatePlantAIScore } from "./aiMatchmaker";
import type { Plant } from "./types";

const samplePlants: Plant[] = [
  {
    id: 1,
    name: "Spider Plant",
    price: 799,
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
    name: "Boston Fern",
    price: 1299,
    category: "plants",
    light: "Indirect light",
    difficulty: "Moderate",
    humidity: "60-80%",
    rooms: "Bathroom",
  },
  {
    id: 4,
    name: "Ceramic Planter Pot",
    price: 499,
    category: "pots",
  },
];

describe("aiMatchmaker", () => {
  it("calculates AI score and personalized reason for a plant", () => {
    const { score, reason, highlights } = calculatePlantAIScore(samplePlants[0], {
      room: "bedroom",
      light: "bright-light",
      experience: "beginner",
      location: "normal",
    });

    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(99);
    expect(reason).toContain("AI Recommendation:");
    expect(highlights.length).toBeGreaterThan(0);
  });

  it("recommends plants and excludes non-plant categories like pots", () => {
    const result = getAIPlantRecommendations(samplePlants, {
      room: "bathroom",
      light: "indirect-light",
      experience: "intermediate",
      location: "humid",
    });

    expect(result.recommendedPlants.length).toBeGreaterThan(0);
    // Pots must not be in recommendations
    const hasPot = result.recommendedPlants.some((p) => p.category === "pots");
    expect(hasPot).toBe(false);

    // Boston fern should score very high for bathroom + humid
    const fern = result.recommendedPlants.find((p) => p.name === "Boston Fern");
    expect(fern).toBeDefined();
    expect(fern?.aiMatchScore).toBeGreaterThanOrEqual(85);
  });

  it("never returns empty recommendations when plants are provided", () => {
    const result = getAIPlantRecommendations(samplePlants, {
      room: "balcony",
      light: "low-light",
      experience: "expert",
      location: "dry",
    });

    expect(result.recommendedPlants.length).toBeGreaterThan(0);
    expect(result.recommendedPlants[0].aiMatchScore).toBeDefined();
    expect(result.recommendedPlants[0].aiMatchReason).toBeDefined();
  });
});
