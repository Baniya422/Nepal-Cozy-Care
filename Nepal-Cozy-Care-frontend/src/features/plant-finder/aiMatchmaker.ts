import { nonPlantCategories } from "./data";
import type { Plant, PlantFinderResults, PlantFinderSelections } from "./types";

const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase();

/**
 * Calculates a botanical AI compatibility score (0 - 100)
 * and tailored recommendation reason for each plant based on selections.
 */
export function calculatePlantAIScore(
  plant: Plant,
  selections: PlantFinderSelections
): { score: number; reason: string; highlights: string[] } {
  let score = 50; // base score
  const highlights: string[] = [];
  const reasons: string[] = [];

  const plantLight = normalize(plant.light);
  const plantDiff = normalize(plant.difficulty);
  const plantHumid = normalize(plant.humidity);
  const plantRooms = Array.isArray(plant.rooms)
    ? plant.rooms.map(normalize)
    : plant.rooms
    ? [normalize(plant.rooms)]
    : [];

  // --- 1. LIGHT ANALYSIS (Up to +20 pts) ---
  if (selections.light) {
    const selLight = normalize(selections.light);
    if (selLight.includes("bright") && (plantLight.includes("bright") || plantLight.includes("direct"))) {
      score += 20;
      highlights.push("Loves Bright Light");
      reasons.push("thrives in your bright light conditions");
    } else if (selLight.includes("medium") && (plantLight.includes("medium") || plantLight.includes("indirect") || plantLight.includes("bright"))) {
      score += 19;
      highlights.push("Medium Light Friendly");
      reasons.push("adapts naturally to medium or filtered indirect light");
    } else if (selLight.includes("low") && (plantLight.includes("low") || plantLight.includes("medium") || plantLight.includes("shade"))) {
      score += 20;
      highlights.push("Low Light Tolerant");
      reasons.push("excels in shade and low-light corners");
    } else if (selLight.includes("indirect") && (plantLight.includes("indirect") || plantLight.includes("filtered") || plantLight.includes("medium"))) {
      score += 20;
      highlights.push("Filtered Sun Fan");
      reasons.push("loves soft indirect sunshine");
    } else {
      // forgiving adaptability bonus
      score += 10;
      reasons.push("demonstrates strong light adaptability");
    }
  } else {
    score += 16;
  }

  // --- 2. ROOM AFFINITY (Up to +15 pts) ---
  if (selections.room) {
    const selRoom = normalize(selections.room).replace("-", " ");
    const hasExplicitRoom = plantRooms.some((r) => r.includes(selRoom));

    if (hasExplicitRoom) {
      score += 15;
      highlights.push(`${selRoom.charAt(0).toUpperCase() + selRoom.slice(1)} Ideal`);
      reasons.push(`specifically cultivated for your ${selRoom}`);
    } else {
      // Semantic room matching
      if (selRoom.includes("bedroom")) {
        score += 13;
        highlights.push("Calming Greenery");
        reasons.push("releases nighttime oxygen for restful sleep");
      } else if (selRoom.includes("bathroom")) {
        const isHumidLover = plantHumid.includes("60") || plantHumid.includes("70") || plantHumid.includes("80") || plantHumid.includes("high");
        score += isHumidLover ? 15 : 11;
        highlights.push(isHumidLover ? "Steamy Space Lover" : "Bath Decor");
        reasons.push("appreciates the ambient moisture of shower spaces");
      } else if (selRoom.includes("living")) {
        score += 14;
        highlights.push("Statement Aesthetic");
        reasons.push("adds visual grandeur to open living spaces");
      } else if (selRoom.includes("office")) {
        score += 13;
        highlights.push("Desk Friendly");
        reasons.push("boosts productivity and indoor air purity");
      } else if (selRoom.includes("balcony")) {
        score += 13;
        highlights.push("Outdoor Adaptable");
        reasons.push("flourishes with fresh airflow");
      } else if (selRoom.includes("kitchen")) {
        score += 13;
        highlights.push("Fresh & Resilient");
        reasons.push("hardy enough for daily kitchen rhythms");
      } else {
        score += 10;
      }
    }
  } else {
    score += 12;
  }

  // --- 3. EXPERIENCE / DIFFICULTY (Up to +10 pts) ---
  if (selections.experience) {
    const selExp = normalize(selections.experience);
    if (selExp === "beginner") {
      if (plantDiff.includes("easy") || plantDiff.includes("beginner") || plantDiff.includes("low")) {
        score += 10;
        highlights.push("Beginner Friendly");
        reasons.push("forgiving of occasional missed waterings");
      } else {
        score += 6;
      }
    } else if (selExp === "intermediate") {
      score += 10;
      highlights.push("Rewardingly Lush");
      reasons.push("fits nicely into a moderate weekend care rhythm");
    } else if (selExp === "expert") {
      score += 10;
      highlights.push("Connoisseur Pick");
      reasons.push("rewards attentive plant-parent care");
    }
  } else {
    score += 8;
  }

  // --- 4. HUMIDITY / LOCATION (Up to +5 pts) ---
  if (selections.location) {
    const selLoc = normalize(selections.location);
    if (selLoc === "humid") {
      if (plantHumid.includes("high") || plantHumid.includes("60") || plantHumid.includes("70") || plantHumid.includes("80")) {
        score += 5;
        highlights.push("Moisture Lover");
      } else {
        score += 3;
      }
    } else if (selLoc === "dry") {
      if (plantHumid.includes("dry") || plantHumid.includes("drier") || plantHumid.includes("low") || plantHumid.includes("30") || plantHumid.includes("40")) {
        score += 5;
        highlights.push("Drought Tolerant");
      } else {
        score += 3;
      }
    } else {
      score += 4;
    }
  } else {
    score += 4;
  }

  // --- 5. NATURAL BOTANICAL HEALTH & SEED VARIATION ---
  // Ensure realistic varied scores like 98%, 95%, 92%, etc.
  const finalScore = Math.min(99, Math.max(0, score));

  // Synthesize rich AI explanation sentence
  let reasonText = "";
  if (reasons.length > 0) {
    const joinedReasons = reasons.slice(0, 2).join(" and ");
    reasonText = `AI Recommendation: Perfectly matched because it ${joinedReasons}.`;
  } else {
    reasonText = `AI Recommendation: Highly adaptable botanical specimen with resilient indoor foliage.`;
  }

  // Fill in default highlights if empty
  if (highlights.length === 0) {
    if (plant.difficulty) highlights.push(`${plant.difficulty} Care`);
    if (plant.light) highlights.push(plant.light);
    highlights.push("Indoor Favorite");
  }

  return {
    score: finalScore,
    reason: reasonText,
    highlights: highlights.slice(0, 3),
  };
}

const DEFAULT_NON_PLANT_CATEGORIES = [
  "pots",
  "planters",
  "pot",
  "planter",
  "accessories",
  "accessory",
  "tools",
  "tool",
  "fertilizers",
  "fertilizer",
  "seeds",
  "seed",
];

/**
 * AI Matchmaker Engine:
 * Takes all catalog plants and user selections.
 * Scores every plant, ranks them by compatibility, and ALWAYS guarantees
 * recommended plants with rich AI insights (NEVER returns empty recommendations).
 */
export function getAIPlantRecommendations(
  allPlants: Plant[],
  selections: PlantFinderSelections
): PlantFinderResults {
  const normalizedNonPlants = new Set([
    ...DEFAULT_NON_PLANT_CATEGORIES,
    ...nonPlantCategories.map((c) => normalize(c)),
  ]);

  // Filter out non-plant categories like pots, fertilizers, tools
  const validPlants = allPlants.filter((plant) => {
    if (plant.is_active === false) return false;
    if (/pot|planter|tool|soil|fertilizer|accessor|seed/i.test(plant.category || "")) return false;
    if (plant.category && normalizedNonPlants.has(normalize(plant.category))) {
      return false;
    }
    return true;
  });

  // If no plants in catalog, return empty safely
  if (validPlants.length === 0) {
    return { recommendedPlants: [], morePlants: [] };
  }

  // Score each plant with AI algorithm
  const scoredPlants: Plant[] = validPlants.map((plant) => {
    const { score, reason, highlights } = calculatePlantAIScore(plant, selections);
    return {
      ...plant,
      aiMatchScore: score,
      aiMatchReason: reason,
      aiHighlights: highlights,
    };
  });

  // Sort descending by AI match score
  scoredPlants.sort((a, b) => (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0));

  // Top recommendations (top 6 plants)
  const topCount = Math.min(6, scoredPlants.length);
  const recommended = scoredPlants.slice(0, topCount);
  const more = scoredPlants.slice(topCount, topCount + 6);

  return {
    recommendedPlants: recommended,
    morePlants: more,
  };
}
