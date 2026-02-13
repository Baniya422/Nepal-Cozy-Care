import type { LucideIcon } from "lucide-react";

export type Severity = "low" | "medium" | "high";

export type SelectOption = {
  id: string;
  label: string;
};

export type SymptomOption = {
  id: string;
  name: string;
  description: string;
};

export type SymptomCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  symptoms: SymptomOption[];
};

export type DiagnosisProfile = {
  id: string;
  title: string;
  summary: string;
  severity: Severity;
  symptoms: string[];
  immediateActions: string[];
  causes: string[];
  solutions: string[];
  prevention: string[];
  relatedCareTips: string[];
  contextBoosts?: {
    plantTypes?: string[];
    environments?: string[];
    seasons?: string[];
    soilStates?: string[];
  };
};

export type DiagnosisResult = DiagnosisProfile & {
  confidence: number;
  matchedSymptoms: string[];
  score: number;
};

export type HealthAnalysis = {
  primary: DiagnosisResult;
  alternatives: DiagnosisResult[];
};

export type PlantHealthHabit = {
  title: string;
  description: string;
  icon: LucideIcon;
};
