import { Bug, Droplets, Leaf, Sun, Thermometer, Wind } from "lucide-react";
import type {
  DiagnosisProfile,
  PlantHealthHabit,
  PlantHealthTemplateHabit,
  PlantHealthTemplatePayload,
  PlantHealthTemplateSymptomCategory,
  SelectOption,
  SymptomCategory,
} from "./types";

const symptomCategoryIconMap = {
  Bug,
  Droplets,
  Leaf,
  Sun,
  Thermometer,
} as const;

const habitIconMap = {
  Droplets,
  Sun,
  Wind,
} as const;

const pickSymptomCategoryIcon = (icon?: string) =>
  symptomCategoryIconMap[icon as keyof typeof symptomCategoryIconMap] ?? Leaf;

const pickHabitIcon = (icon?: string) => habitIconMap[icon as keyof typeof habitIconMap] ?? Leaf;

const mapTemplateCategories = (
  categories: PlantHealthTemplateSymptomCategory[]
): SymptomCategory[] =>
  categories.map((category) => ({
    ...category,
    icon: pickSymptomCategoryIcon(category.icon),
  }));

const mapTemplateHabits = (habits: PlantHealthTemplateHabit[]): PlantHealthHabit[] =>
  habits.map((habit) => ({
    ...habit,
    icon: pickHabitIcon(habit.icon),
  }));

const emptyDiagnosis: DiagnosisProfile = {
  id: "template_not_loaded",
  title: "Template Not Loaded",
  summary: "Plant health template is not loaded yet.",
  severity: "medium",
  symptoms: [],
  immediateActions: [],
  causes: [],
  solutions: [],
  prevention: [],
  relatedCareTips: [],
};

export let symptomCategories: SymptomCategory[] = [];
export let allSymptoms = symptomCategories.flatMap((category) => category.symptoms);
export let plantTypeOptions: SelectOption[] = [];
export let environmentOptions: SelectOption[] = [];
export let soilOptions: SelectOption[] = [];
export let seasonOptions: SelectOption[] = [];
export let diagnosisProfiles: DiagnosisProfile[] = [];
export let defaultDiagnosis: DiagnosisProfile = emptyDiagnosis;
export let healthyPlantHabits: PlantHealthHabit[] = [];

export const getCurrentSeason = () => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return "spring";
  if (month === 5 || month === 6) return "summer";
  if (month >= 7 && month <= 8) return "monsoon";
  if (month >= 9 && month <= 10) return "autumn";
  return "winter";
};

export const applyPlantHealthTemplate = (template?: PlantHealthTemplatePayload | null) => {
  symptomCategories = mapTemplateCategories(template?.symptom_categories ?? []);
  allSymptoms = symptomCategories.flatMap((category) => category.symptoms);

  plantTypeOptions = Array.isArray(template?.plant_type_options) ? template.plant_type_options : [];
  environmentOptions = Array.isArray(template?.environment_options)
    ? template.environment_options
    : [];
  soilOptions = Array.isArray(template?.soil_options) ? template.soil_options : [];
  seasonOptions = Array.isArray(template?.season_options) ? template.season_options : [];

  diagnosisProfiles = Array.isArray(template?.diagnosis_profiles) ? template.diagnosis_profiles : [];
  defaultDiagnosis = template?.default_diagnosis ?? emptyDiagnosis;

  healthyPlantHabits = mapTemplateHabits(template?.healthy_plant_habits ?? []);
};

