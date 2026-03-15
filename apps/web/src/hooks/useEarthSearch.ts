// Hook tích hợp Earth Search STAC API (Element 84) cho Sentinel-1 GRD
// API: https://earth-search.aws.element84.com/v1
//
// ⚠️ COG assets (vv/vh) nằm trên S3 requester-pays bucket (sentinel-s1-l1c)
//    → Không thể truy cập trực tiếp từ browser
// ✅ Thumbnail preview: có endpoint HTTPS miễn phí từ Earth Search
// ✅ STAC metadata: datetime, platform, bbox, polarizations
//
// Approach: Dùng thumbnail preview overlay lên Mapbox via image source
//           + hiển thị metadata trên UI

import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { searchSentinel1 } from "../services/earthSearch";
import type { STACItem } from "@floodshield/shared";

// ── Query key ────────────────────────────────────────────────────────────────

export const EARTH_SEARCH_KEY = ["earth-search-sentinel1"] as const;

// ── Earth Search thumbnail endpoint (free, no auth) ──────────────────────────
// Format: https://earth-search.aws.element84.com/v1/collections/sentinel-1-grd/items/{id}/thumbnail

const EARTH_SEARCH_BASE = "https://earth-search.aws.element84.com/v1";

function getThumbnailUrl(itemId: string): string {
    return `${EARTH_SEARCH_BASE}/collections/sentinel-1-grd/items/${itemId}/thumbnail`;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface SentinelLayer {
    id: string;
    datetime: string;
    platform: string;
    polarizations: string[];
    instrumentMode: string;
    orbitState: string;
    thumbnailUrl: string;
    bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
    geometry: {
        type: "Polygon";
        coordinates: number[][][];
    };
    // S3 COG URLs (requires requester-pays credentials — for reference only)
    vvS3Href: string | null;
    vhS3Href: string | null;
}

// ── Extract layer data from STAC items ───────────────────────────────────────

function itemToLayer(item: STACItem): SentinelLayer {
    const vvAsset = item.assets.vv ?? item.assets.VV;
    const vhAsset = item.assets.vh ?? item.assets.VH;

    return {
        id: item.id,
        datetime: item.properties.datetime,
        platform: item.properties.platform,
        polarizations: item.properties["sar:polarizations"] ?? [],
        instrumentMode: item.properties["sar:instrument_mode"] ?? "IW",
        orbitState: (item.properties as Record<string, unknown>)["sat:orbit_state"] as string ?? "unknown",
        thumbnailUrl: getThumbnailUrl(item.id),
        bbox: item.bbox as [number, number, number, number],
        geometry: item.geometry,
        vvS3Href: vvAsset?.href ?? null,
        vhS3Href: vhAsset?.href ?? null,
    };
}

// ── React Query hook — fetch STAC items for Mekong Delta ─────────────────────

export function useEarthSearchLayers() {
    return useQuery({
        queryKey: EARTH_SEARCH_KEY,
        queryFn: async (): Promise<SentinelLayer[]> => {
            // Search Mekong Delta bbox (already configured in EARTH_SEARCH_CONFIG)
            const items = await searchSentinel1({ days: 30, limit: 5 });
            return items
                .map(itemToLayer)
                // Chỉ lấy IW mode (Interferometric Wide — phổ biến nhất cho flood mapping)
                .filter((l) => l.instrumentMode === "IW");
        },
        staleTime: 10 * 60 * 1000, // 10 min — satellite revisit 6-12 ngày
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    });
}

// ── Mapbox layer management ──────────────────────────────────────────────────

const LAYER_PREFIX = "sentinel1";

function sourceId(idx: number) { return `${LAYER_PREFIX}-source-${idx}`; }
function layerId(idx: number) { return `${LAYER_PREFIX}-layer-${idx}`; }
function outlineSourceId(idx: number) { return `${LAYER_PREFIX}-outline-source-${idx}`; }
function outlineLayerId(idx: number) { return `${LAYER_PREFIX}-outline-layer-${idx}`; }

export function useSentinelMapLayers() {
    const activeRef = useRef<number | null>(null);

    /**
     * Thêm Sentinel-1 thumbnail preview lên Mapbox map.
     * Dùng image source + raster layer, vị trí chính xác từ bbox.
     */
    const addSentinelLayer = useCallback(
        (map: mapboxgl.Map, layer: SentinelLayer, idx: number = 0) => {
            // Xóa layer cũ nếu có
            removeSentinelLayers(map);

            const [minLon, minLat, maxLon, maxLat] = layer.bbox;

            // Image source: overlay thumbnail at exact bbox coordinates
            map.addSource(sourceId(idx), {
                type: "image",
                url: layer.thumbnailUrl,
                coordinates: [
                    [minLon, maxLat], // top-left
                    [maxLon, maxLat], // top-right
                    [maxLon, minLat], // bottom-right
                    [minLon, minLat], // bottom-left
                ],
            });

            map.addLayer(
                {
                    id: layerId(idx),
                    type: "raster",
                    source: sourceId(idx),
                    paint: {
                        "raster-opacity": 0.65,
                        "raster-fade-duration": 300,
                    },
                },
                // Insert BEFORE flood-fill polygons
                map.getLayer("flood-fill") ? "flood-fill" : undefined,
            );

            // Outline: hiển thị coverage boundary
            map.addSource(outlineSourceId(idx), {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: layer.geometry,
                    properties: {
                        id: layer.id,
                        datetime: layer.datetime,
                        platform: layer.platform,
                    },
                },
            });

            map.addLayer(
                {
                    id: outlineLayerId(idx),
                    type: "line",
                    source: outlineSourceId(idx),
                    paint: {
                        "line-color": "#10b981", // emerald-500
                        "line-width": 2,
                        "line-dasharray": [4, 2],
                        "line-opacity": 0.8,
                    },
                },
                map.getLayer("flood-fill") ? "flood-fill" : undefined,
            );

            activeRef.current = idx;
        },
        [],
    );

    /**
     * Xóa tất cả Sentinel-1 layers khỏi map.
     */
    const removeSentinelLayers = useCallback((map: mapboxgl.Map) => {
        // Remove up to 10 possible layers
        for (let i = 0; i < 10; i++) {
            if (map.getLayer(layerId(i))) map.removeLayer(layerId(i));
            if (map.getLayer(outlineLayerId(i))) map.removeLayer(outlineLayerId(i));
            if (map.getSource(sourceId(i))) map.removeSource(sourceId(i));
            if (map.getSource(outlineSourceId(i))) map.removeSource(outlineSourceId(i));
        }
        activeRef.current = null;
    }, []);

    /**
     * Toggle bật/tắt layer.
     */
    const toggleSentinelLayer = useCallback(
        (map: mapboxgl.Map, layer: SentinelLayer, idx: number = 0) => {
            if (activeRef.current !== null) {
                removeSentinelLayers(map);
            } else {
                addSentinelLayer(map, layer, idx);
            }
        },
        [addSentinelLayer, removeSentinelLayers],
    );

    return {
        addSentinelLayer,
        removeSentinelLayers,
        toggleSentinelLayer,
        activeRef,
    };
}
