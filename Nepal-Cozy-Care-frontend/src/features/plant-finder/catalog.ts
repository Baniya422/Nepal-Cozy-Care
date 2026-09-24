import { extractPlantsFromResponse } from "./utils";
import type { Plant } from "./types";

export async function fetchPlantFinderCatalog(api: string): Promise<Plant[]> {
  const plants: Plant[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const response = await fetch(`${api}/api/plants?per_page=100&page=${page}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Unable to load the plant catalog");
    const payload = await response.json();
    plants.push(...extractPlantsFromResponse(payload));
    lastPage = Number(payload.data?.pagination?.last_page) || 1;
    page++;
  } while (page <= lastPage);
  return plants;
}
