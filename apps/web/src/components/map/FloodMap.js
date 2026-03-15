import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// FloodMap component — Mapbox GL JS
import { useRef, useEffect } from "react";
import { Layers } from "lucide-react";
import { useMap } from "../../hooks/useMap";
import { useFloodZones } from "../../hooks/useFloodData";
import { useAppStore } from "../../stores/appStore";
import { MapStyleToggle } from "./MapStyleToggle";
import { MapLegend } from "./MapLegend";
export function FloodMap() {
    const containerRef = useRef(null);
    const { mapRef, updateFloodZones, flyTo } = useMap({ containerRef });
    const { data: zones, isLoading } = useFloodZones();
    const { selectedZoneId } = useAppStore();
    // Update flood zones when data changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !zones)
            return;
        const onStyleLoad = () => updateFloodZones(zones);
        if (map.isStyleLoaded()) {
            updateFloodZones(zones);
        }
        else {
            map.once("style.load", onStyleLoad);
        }
    }, [zones, mapRef, updateFloodZones]);
    // Fly to selected zone
    useEffect(() => {
        if (!selectedZoneId || !zones)
            return;
        const zone = zones.find((z) => z.id === selectedZoneId);
        if (!zone)
            return;
        // Get centroid from geometry bbox
        const coords = zone.geometry.coordinates[0];
        if (!coords || coords.length === 0)
            return;
        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        flyTo([centerLon, centerLat], 11);
    }, [selectedZoneId, zones, flyTo]);
    return (_jsxs("div", { className: "relative w-full h-full min-h-[400px]", children: [_jsx("div", { ref: containerRef, className: "absolute inset-0 rounded-xl", "aria-label": "B\u1EA3n \u0111\u1ED3 l\u0169 l\u1EE5t \u0110BSCL", role: "img" }), isLoading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-950/70 rounded-xl z-10", children: _jsxs("div", { className: "flex items-center gap-3 text-gray-300", children: [_jsx("div", { className: "w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin", "aria-hidden": true }), _jsx("span", { children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u v\u1EC7 tinh..." })] }) })), _jsx("div", { className: "absolute top-4 left-4 z-10 space-y-2", children: _jsx(MapStyleToggle, {}) }), _jsx("div", { className: "absolute bottom-8 right-4 z-10", children: _jsx(MapLegend, {}) }), zones && zones.length > 0 && (_jsx("div", { className: "absolute top-4 right-16 z-10 card py-1.5 px-3 text-xs", children: _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Layers, { className: "w-3.5 h-3.5 text-blue-400", "aria-hidden": true }), _jsxs("span", { children: [zones.length, " v\u00F9ng l\u0169 \u0111ang theo d\u00F5i"] })] }) }))] }));
}
//# sourceMappingURL=FloodMap.js.map