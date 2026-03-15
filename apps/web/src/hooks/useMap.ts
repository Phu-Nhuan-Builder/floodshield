// Mapbox GL JS map hook
import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useAppStore } from "../stores/appStore";
import type { FloodZone } from "@floodshield/shared";
import { severityToColor, formatVietnamDate, formatKm2, severityToLabel } from "@floodshield/shared";

const MAP_STYLES = {
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  streets: "mapbox://styles/mapbox/streets-v12",
} as const;

interface UseMapOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  center?: [number, number];
  zoom?: number;
}

export function useMap({ containerRef, center = [105.0, 10.0], zoom = 7 }: UseMapOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { mapStyle, setSelectedZoneId } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error("VITE_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES[mapStyle],
      center,
      zoom,
      minZoom: 5,
      maxZoom: 16,
      // Accessibility
      localIdeographFontFamily: "'Be Vietnam Pro', 'Noto Sans', sans-serif",
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Click handler for flood zones
    map.on("click", "flood-fill", (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;

      const props = feature.properties as FloodZone["geometry"] & FloodZone;
      setSelectedZoneId(props.id);

      new mapboxgl.Popup({ maxWidth: "280px", className: "flood-popup" })
        .setLngLat(e.lngLat)
        .setHTML(
          `<div class="p-1">
            <div class="font-semibold text-sm mb-1">${props.district}, ${props.province}</div>
            <div class="text-xs text-gray-400 mb-2">${formatVietnamDate(props.detectedAt)}</div>
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-block w-3 h-3 rounded-full" style="background:${severityToColor(props.severity)}"></span>
              <span class="text-sm font-medium">${severityToLabel(props.severity)}</span>
            </div>
            <div class="text-xs text-gray-400">Diện tích: ${formatKm2(props.floodedAreaKm2)}</div>
            <div class="text-xs text-gray-400">Chỉ số: ${(props.floodIndex * 100).toFixed(1)}%</div>
          </div>`,
        )
        .addTo(map);
    });

    // Cursor change on hover
    map.on("mouseenter", "flood-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "flood-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map style when changed
  useEffect(() => {
    mapRef.current?.setStyle(MAP_STYLES[mapStyle]);
  }, [mapStyle]);

  // Update flood zones on map
  const updateFloodZones = useCallback((zones: FloodZone[]) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Build GeoJSON FeatureCollection
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: zones.map((z) => ({
        type: "Feature",
        id: z.id,
        geometry: z.geometry,
        properties: {
          id: z.id,
          province: z.province,
          district: z.district,
          severity: z.severity,
          floodIndex: z.floodIndex,
          floodedAreaKm2: z.floodedAreaKm2,
          detectedAt: z.detectedAt,
          confidence: z.confidence,
        },
      })),
    };

    // Remove existing layers/sources
    ["flood-fill", "flood-outline", "flood-pulse"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("flood-data")) map.removeSource("flood-data");

    // Add new
    map.addSource("flood-data", { type: "geojson", data: geojson });

    map.addLayer({
      id: "flood-fill",
      type: "fill",
      source: "flood-data",
      paint: {
        "fill-color": [
          "match",
          ["get", "severity"],
          "low",      "#FFF176",
          "medium",   "#FFB300",
          "high",     "#F44336",
          "critical", "#B71C1C",
          "#90CAF9",
        ],
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0.7, 12, 0.4],
      },
    });

    map.addLayer({
      id: "flood-outline",
      type: "line",
      source: "flood-data",
      paint: {
        "line-color": "#FFFFFF",
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 10, 2],
        "line-opacity": 0.8,
      },
    });
  }, []);

  const flyTo = useCallback((center: [number, number], zoom?: number) => {
    mapRef.current?.flyTo({ center, zoom: zoom ?? 10, duration: 1000 });
  }, []);

  return { mapRef, updateFloodZones, flyTo };
}
