import type { FloodZone } from "@floodshield/shared";
interface UseMapOptions {
    containerRef: React.RefObject<HTMLDivElement>;
    center?: [number, number];
    zoom?: number;
}
export declare function useMap({ containerRef, center, zoom }: UseMapOptions): {
    mapRef: import("react").MutableRefObject<import("mapbox-gl").Map | null>;
    updateFloodZones: (zones: FloodZone[]) => void;
    flyTo: (center: [number, number], zoom?: number) => void;
};
export {};
//# sourceMappingURL=useMap.d.ts.map