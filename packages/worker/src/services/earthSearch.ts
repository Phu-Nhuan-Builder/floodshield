// Earth Search STAC client — Worker-side
import type { STACItem } from "@floodshield/shared";
import { EARTH_SEARCH_CONFIG } from "@floodshield/shared";

export async function searchSentinel1(options: {
  bbox: [number, number, number, number];
  days: number;
  limit: number;
}): Promise<STACItem[]> {
  const end = new Date();
  const start = new Date(Date.now() - options.days * 24 * 60 * 60 * 1000);
  // Earth Search requires full RFC3339 format: "2024-08-01T00:00:00Z/2024-09-30T23:59:59Z"
  const dateRange = `${start.toISOString()}/${end.toISOString()}`;

  // Earth Search v1 STAC search payload
  // Note: sortby uses `+` prefix for ascending, `-` for descending in some implementations
  // Use explicit object form for maximum compatibility
  const body = {
    collections: [EARTH_SEARCH_CONFIG.COLLECTION],
    bbox: options.bbox,
    datetime: dateRange,
    limit: options.limit,
    // sortby is optional — omit to avoid 400 from strict validators
  };

  const res = await fetch(`${EARTH_SEARCH_CONFIG.BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cf: { cacheTtl: 300, cacheEverything: false }, // Cloudflare fetch options
  } as RequestInit & { cf?: Record<string, unknown> });

  if (!res.ok) {
    const errText = await res.text().catch(() => "(unreadable)");
    throw new Error(`Earth Search failed: ${res.status} ${res.statusText} — ${errText.slice(0, 200)}`);
  }

  const data: { features: STACItem[]; numberMatched: number } = await res.json();

  // Sort by datetime descending in JS (avoid relying on STAC server sortby)
  return data.features.sort((a, b) =>
    new Date(b.properties.datetime).getTime() - new Date(a.properties.datetime).getTime()
  );
}
