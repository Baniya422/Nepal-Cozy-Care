import type {
  CatalogPlant,
  CategoryFilter,
  PriceFilterKey,
  SortOption,
} from "./types";

export const normalizeCatalogPlants = (plants: CatalogPlant[]): CatalogPlant[] =>
  plants.map((plant) => ({
    ...plant,
    price:
      typeof plant.price === "string"
        ? parseFloat(plant.price)
        : plant.price || 0,
  }));

export const extractCatalogPlants = (payload: any): CatalogPlant[] => {
  const rawPlants = payload?.data?.data ?? payload?.data?.plants ?? payload?.data ?? [];
  return normalizeCatalogPlants(Array.isArray(rawPlants) ? rawPlants : []);
};

export const toggleStringValue = <T extends string>(items: T[], value: T) =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

export const toggleNumberValue = (items: number[], value: number) =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

export const matchesPriceRange = (price: number, range: PriceFilterKey) => {
  if (range === "under-500") return price < 500;
  if (range === "500-1000") return price >= 500 && price <= 1000;
  if (range === "1000-2000") return price > 1000 && price <= 2000;
  if (range === "over-2000") return price > 2000;
  return true;
};

export const filterCatalogPlants = ({
  plants,
  searchTerm,
  priceFilters,
  ratingFilters,
  category,
}: {
  plants: CatalogPlant[];
  searchTerm: string;
  priceFilters: PriceFilterKey[];
  ratingFilters: number[];
  category?: CategoryFilter;
}) => {
  let data = [...plants];

  if (category && category !== "all") {
    data = data.filter((plant) => {
      const itemCategory = (plant.category || "plants").toLowerCase();
      return itemCategory.includes(category);
    });
  }

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    data = data.filter((plant) => plant.name.toLowerCase().includes(query));
  }

  if (priceFilters.length > 0) {
    data = data.filter((plant) =>
      priceFilters.some((range) => matchesPriceRange(Number(plant.price), range))
    );
  }

  if (ratingFilters.length > 0) {
    data = data.filter((plant) => {
      const rating = plant.avg_rating ?? 5;
      return ratingFilters.some((minimum) => rating >= minimum);
    });
  }

  return data;
};

export const sortCatalogPlants = (plants: CatalogPlant[], sort: SortOption) => {
  const data = [...plants];

  data.sort((first, second) => {
    if (sort === "price-asc") return Number(first.price) - Number(second.price);
    if (sort === "price-desc") return Number(second.price) - Number(first.price);
    if (sort === "name-asc") return first.name.localeCompare(second.name);

    if (sort === "sales") {
      const firstSales = first.total_sold ?? 0;
      const secondSales = second.total_sold ?? 0;
      if (secondSales !== firstSales) return secondSales - firstSales;
      return first.name.localeCompare(second.name);
    }

    const firstRating = first.avg_rating ?? 0;
    const secondRating = second.avg_rating ?? 0;
    if (secondRating !== firstRating) return secondRating - firstRating;
    return first.name.localeCompare(second.name);
  });

  return data;
};
