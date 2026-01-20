import type {
  CategoryFilter,
  PriceFilterKey,
  SortChoice,
} from "./types";

export const priceFilterOptions: Array<{
  value: PriceFilterKey;
  label: string;
}> = [
  { value: "under-500", label: "Under Rs 500" },
  { value: "500-1000", label: "Rs 500 - Rs 1000" },
  { value: "1000-2000", label: "Rs 1000 - Rs 2000" },
  { value: "over-2000", label: "Over Rs 2000" },
];

export const ratingFilterOptions = [4, 3, 2];

export const categoryFilterOptions: Array<{
  value: CategoryFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "plants", label: "Plants" },
  { value: "pots", label: "Pots" },
  { value: "accessories", label: "Accessories" },
  { value: "tools", label: "Tools" },
];

export const popularSortOptions: SortChoice[] = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A-Z" },
];

export const bestSellerSortOptions: SortChoice[] = [
  { value: "sales", label: "Most Sold" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A-Z" },
];
