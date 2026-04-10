import type {
  ExperienceKey,
  FinderOption,
  LightKey,
  LocationKey,
  PlantFinderPreviewData,
  PlantFinderTemplatePayload,
  RoomKey,
} from "./types";

const emptyPreviewData: PlantFinderPreviewData = {
  room: {},
  light: {},
  experience: {},
  location: {},
};

export let roomOptions: FinderOption<RoomKey>[] = [];
export let lightOptions: FinderOption<LightKey>[] = [];
export let experienceOptions: FinderOption<ExperienceKey>[] = [];
export let locationOptions: FinderOption<LocationKey>[] = [];

export let lightMap: Record<string, string> = {};
export let difficultyMap: Record<string, string> = {};
export let humidityMap: Record<string, string> = {};
export let roomMap: Record<string, string> = {};
export let nonPlantCategories: string[] = [];
export let previewData: PlantFinderPreviewData = emptyPreviewData;

export const applyPlantFinderTemplate = (template?: PlantFinderTemplatePayload | null) => {
  roomOptions = Array.isArray(template?.room_options) ? template.room_options : [];
  lightOptions = Array.isArray(template?.light_options) ? template.light_options : [];
  experienceOptions = Array.isArray(template?.experience_options)
    ? template.experience_options
    : [];
  locationOptions = Array.isArray(template?.location_options) ? template.location_options : [];

  lightMap = template?.light_map ?? {};
  difficultyMap = template?.difficulty_map ?? {};
  humidityMap = template?.humidity_map ?? {};
  roomMap = template?.room_map ?? {};
  nonPlantCategories = Array.isArray(template?.non_plant_categories)
    ? template.non_plant_categories
    : [];
  previewData = template?.preview_data ?? emptyPreviewData;
};

