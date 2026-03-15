import { EARTH_SEARCH_CONFIG, MEKONG_BBOX, formatDateRange } from "@floodshield/shared";
const BASE_URL = EARTH_SEARCH_CONFIG.BASE_URL;
export async function searchSentinel1(options) {
    const bbox = options?.bbox ?? MEKONG_BBOX;
    const dateRange = formatDateRange(options?.days ?? EARTH_SEARCH_CONFIG.SEARCH_DAYS);
    const limit = options?.limit ?? EARTH_SEARCH_CONFIG.MAX_RESULTS;
    const req = {
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
    const data = await res.json();
    return data.features;
}
export async function getSTACItemById(id) {
    const res = await fetch(`${BASE_URL}/collections/${EARTH_SEARCH_CONFIG.COLLECTION}/items/${id}`);
    if (!res.ok) {
        throw new Error(`STAC item not found: ${id}`);
    }
    return res.json();
}
//# sourceMappingURL=earthSearch.js.map