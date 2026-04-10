export type RoomKey =
  | ""
  | "bedroom"
  | "living-room"
  | "kitchen"
  | "bathroom"
  | "office"
  | "balcony";

export type LightKey =
  | ""
  | "bright-light"
  | "medium-light"
  | "low-light"
  | "indirect-light";

export type ExperienceKey = "" | "beginner" | "intermediate" | "expert";

export type LocationKey = "" | "dry" | "normal" | "humid";

export type ActiveField = "room" | "light" | "experience" | "location";

export type FinderOption<T extends string = string> = {
  value: T;
  label: string;
};

export type PreviewContent = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
};

export type PlantFinderSelections = {
  room: RoomKey;
  light: LightKey;
  experience: ExperienceKey;
  location: LocationKey;
};

export type Plant = {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  avg_rating?: number;
  category?: string;
  light?: string;
  difficulty?: string;
  humidity?: string;
  rooms?: string[] | string | null;
};

export type PlantFinderResults = {
  recommendedPlants: Plant[];
  morePlants: Plant[];
};

export type PlantFinderPreviewData = Record<ActiveField, Record<string, PreviewContent>>;

export type PlantFinderTemplatePayload = {
  room_options?: FinderOption<RoomKey>[];
  light_options?: FinderOption<LightKey>[];
  experience_options?: FinderOption<ExperienceKey>[];
  location_options?: FinderOption<LocationKey>[];
  light_map?: Record<string, string>;
  difficulty_map?: Record<string, string>;
  humidity_map?: Record<string, string>;
  room_map?: Record<string, string>;
  non_plant_categories?: string[];
  preview_data?: PlantFinderPreviewData;
};
