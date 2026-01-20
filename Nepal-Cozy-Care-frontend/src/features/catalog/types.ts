export type CatalogPlant = {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  avg_rating?: number;
  total_sold?: number;
  category?: string;
};

export type PriceFilterKey =
  | "under-500"
  | "500-1000"
  | "1000-2000"
  | "over-2000";

export type CategoryFilter =
  | "all"
  | "plants"
  | "pots"
  | "accessories"
  | "tools";

export type SortOption = "popular" | "sales" | "price-asc" | "price-desc" | "name-asc";

export type SortChoice<T extends string = string> = {
  value: T;
  label: string;
};

export type ToggleStringSetter = (value: PriceFilterKey) => void;
export type ToggleNumberSetter = (value: number) => void;
