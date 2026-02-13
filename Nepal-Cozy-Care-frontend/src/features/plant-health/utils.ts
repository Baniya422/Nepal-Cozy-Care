import {
  allSymptoms,
  defaultDiagnosis,
  diagnosisProfiles,
} from "./data";
import type {
  DiagnosisResult,
  HealthAnalysis,
  SelectOption,
  Severity,
} from "./types";

type AnalyzePlantHealthParams = {
  selectedSymptoms: string[];
  plantType: string;
  environment: string;
  season: string;
  soilState: string;
};

export const titleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const getSymptomName = (symptomId: string) =>
  allSymptoms.find((symptom) => symptom.id === symptomId)?.name ?? titleCase(symptomId);

export const getOptionLabel = (items: SelectOption[], value: string) =>
  items.find((item) => item.id === value)?.label ?? titleCase(value);

export const getActionWindow = (severity: Severity) => {
  switch (severity) {
    case "high":
      return "Take action today";
    case "medium":
      return "Adjust care within 24-48 hours";
    case "low":
    default:
      return "Monitor and improve routine";
  }
};

export const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case "low":
      return "severity-low";
    case "medium":
      return "severity-medium";
    case "high":
      return "severity-high";
    default:
      return "severity-medium";
  }
};

export const getProgressValue = (selectedSymptoms: string[], soilState: string) =>
  Math.min(100, 18 + selectedSymptoms.length * 14 + (soilState !== "unknown" ? 8 : 0));

export const analyzePlantHealth = ({
  selectedSymptoms,
  plantType,
  environment,
  season,
  soilState,
}: AnalyzePlantHealthParams): HealthAnalysis => {
  const scoredDiagnoses = diagnosisProfiles
    .map((profile) => {
      const matchedSymptoms = profile.symptoms.filter((symptom) =>
        selectedSymptoms.includes(symptom)
      );

      let contextScore = 0;

      if (profile.contextBoosts?.plantTypes?.includes(plantType)) contextScore += 6;
      if (profile.contextBoosts?.environments?.includes(environment)) contextScore += 6;
      if (profile.contextBoosts?.seasons?.includes(season)) contextScore += 5;
      if (profile.contextBoosts?.soilStates?.includes(soilState)) contextScore += 8;

      let score = matchedSymptoms.length * 16 + contextScore;

      if (matchedSymptoms.length >= 2) score += 10;
      if (matchedSymptoms.length >= 3) score += 6;

      const confidence = Math.min(
        96,
        Math.max(42, 34 + matchedSymptoms.length * 17 + Math.round(contextScore * 1.4))
      );

      return {
        ...profile,
        matchedSymptoms,
        score,
        confidence,
      };
    })
    .filter((profile) => profile.score > 0)
    .sort((first, second) => second.score - first.score);

  const primaryDiagnosis =
    scoredDiagnoses[0] ??
    ({
      ...defaultDiagnosis,
      matchedSymptoms: [...selectedSymptoms],
      score: 1,
      confidence: 45,
    } satisfies DiagnosisResult);

  const alternatives = scoredDiagnoses
    .slice(1)
    .filter((profile) => profile.score >= primaryDiagnosis.score - 12)
    .slice(0, 2);

  return {
    primary: primaryDiagnosis,
    alternatives,
  };
};
