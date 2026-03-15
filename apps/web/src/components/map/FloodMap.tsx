// FloodMap component — Mapbox GL JS
import { useRef, useEffect } from "react";
import { Layers } from "lucide-react";
import { useMap } from "../../hooks/useMap";
import { useFloodZones } from "../../hooks/useFloodData";
import { useAppStore } from "../../stores/appStore";
import { MapStyleToggle } from "./MapStyleToggle";
import { MapLegend } from "./MapLegend";
import { SentinelLayerToggle } from "./SentinelLayerToggle";

export function FloodMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, updateFloodZones, flyTo } = useMap({ containerRef });
  const { data: zones, isLoading } = useFloodZones();
  const { selectedZoneId } = useAppStore();

  // Update flood zones when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zones) return;

    const onStyleLoad = () => updateFloodZones(zones);

    if (map.isStyleLoaded()) {
      updateFloodZones(zones);
    } else {
      map.once("style.load", onStyleLoad);
    }
  }, [zones, mapRef, updateFloodZones]);

  // Fly to selected zone
  useEffect(() => {
    if (!selectedZoneId || !zones) return;
    const zone = zones.find((z) => z.id === selectedZoneId);
    if (!zone) return;

    // Get centroid from geometry bbox
    const coords = zone.geometry.coordinates[0];
    if (!coords || coords.length === 0) return;
    const lons = coords.map((c) => c[0]!);
    const lats = coords.map((c) => c[1]!);
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    flyTo([centerLon, centerLat], 11);
  }, [selectedZoneId, zones, flyTo]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0 rounded-xl" aria-label="Bản đồ lũ lụt ĐBSCL" role="img" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/70 rounded-xl z-10">
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" aria-hidden />
            <span>Đang tải dữ liệu vệ tinh...</span>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <MapStyleToggle />
        <SentinelLayerToggle mapRef={mapRef} />
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-4 z-10">
        <MapLegend />
      </div>

      {/* Zone count badge */}
      {zones && zones.length > 0 && (
        <div className="absolute top-4 right-16 z-10 card py-1.5 px-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" aria-hidden />
            <span>{zones.length} vùng lũ đang theo dõi</span>
          </div>
        </div>
      )}
    </div>
  );
}

