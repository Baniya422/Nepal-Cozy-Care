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

export type PlantHealthTemplateSymptomCategory = {
  id: string;
  name: string;
  icon?: string;
  symptoms: SymptomOption[];
};

export type PlantHealthTemplateHabit = {
  title: string;
  description: string;
  icon?: string;
};

export type PlantHealthTemplatePayload = {
  symptom_categories?: PlantHealthTemplateSymptomCategory[];
  plant_type_options?: SelectOption[];
  environment_options?: SelectOption[];
  soil_options?: SelectOption[];
  season_options?: SelectOption[];
  diagnosis_profiles?: DiagnosisProfile[];
  default_diagnosis?: DiagnosisProfile;
  healthy_plant_habits?: PlantHealthTemplateHabit[];
};
