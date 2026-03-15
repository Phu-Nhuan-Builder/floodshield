// Earth Search STAC API Service
import type { STACItem, STACSearchRequest } from "@floodshield/shared";
import { EARTH_SEARCH_CONFIG, MEKONG_BBOX, formatDateRange } from "@floodshield/shared";

const BASE_URL = EARTH_SEARCH_CONFIG.BASE_URL;

export async function searchSentinel1(options?: {
  bbox?: [number, number, number, number];
  days?: number;
  limit?: number;
}): Promise<STACItem[]> {
  const bbox = options?.bbox ?? MEKONG_BBOX;
  const dateRange = formatDateRange(options?.days ?? EARTH_SEARCH_CONFIG.SEARCH_DAYS);
  const limit = options?.limit ?? EARTH_SEARCH_CONFIG.MAX_RESULTS;

  const req: STACSearchRequest = {
    collections: [EARTH_SEARCH_CONFIG.COLLECTION],
    bbox,
    datetime: dateRange,
    limit,
    sortby: [{ field: "properties.datetime", direction: "desc" }],
  };

  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`Earth Search failed: ${res.status} ${res.statusText}`);
  }

  const data: { features: STACItem[]; numberMatched: number } = await res.json();
  return data.features;
}

export async function getSTACItemById(id: string): Promise<STACItem> {
  const res = await fetch(
    `${BASE_URL}/collections/${EARTH_SEARCH_CONFIG.COLLECTION}/items/${id}`,
  );

  if (!res.ok) {
    throw new Error(`STAC item not found: ${id}`);
  }

  return res.json() as Promise<STACItem>;
}
