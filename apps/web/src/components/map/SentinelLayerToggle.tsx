// Sentinel-1 Layer Toggle — bật/tắt ảnh vệ tinh Earth Search (Element 84) trên bản đồ
// API: https://earth-search.aws.element84.com/v1
import { useState, useCallback, useEffect } from "react";
import { Radar, Eye, EyeOff, ChevronDown, Satellite } from "lucide-react";
import { useEarthSearchLayers, useSentinelMapLayers } from "../../hooks/useEarthSearch";
import type { SentinelLayer } from "../../hooks/useEarthSearch";

interface Props {
    mapRef: React.RefObject<mapboxgl.Map | null>;
}

export function SentinelLayerToggle({ mapRef }: Props) {
    const { data: layers, isLoading, error } = useEarthSearchLayers();
    const { addSentinelLayer, removeSentinelLayers, activeRef } = useSentinelMapLayers();

    const [isVisible, setIsVisible] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [expanded, setExpanded] = useState(false);

    const selectedLayer: SentinelLayer | undefined = layers?.[selectedIdx];

    // Toggle layer on/off
    const handleToggle = useCallback(() => {
        const map = mapRef.current;
        if (!map || !selectedLayer) return;

        if (isVisible) {
            removeSentinelLayers(map);
            setIsVisible(false);
        } else {
            addSentinelLayer(map, selectedLayer, selectedIdx);
            setIsVisible(true);
        }
    }, [mapRef, selectedLayer, selectedIdx, isVisible, addSentinelLayer, removeSentinelLayers]);

    // Switch selected item while layer is active
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isVisible || !selectedLayer) return;
        removeSentinelLayers(map);
        addSentinelLayer(map, selectedLayer, selectedIdx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIdx]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const map = mapRef.current;
            if (map && activeRef.current !== null) {
                removeSentinelLayers(map);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return (
            <div className="card p-2 text-xs text-red-400 flex items-center gap-1.5">
                <Radar className="w-3.5 h-3.5" aria-hidden />
                <span>Earth Search không khả dụng</span>
            </div>
        );
    }

    return (
        <div className="card p-2 min-w-[200px]">
            {/* Toggle button */}
            <button
                onClick={handleToggle}
                disabled={isLoading || !selectedLayer}
                className="flex items-center gap-2 w-full text-left text-xs font-medium transition-colors
          hover:text-white disabled:opacity-50 disabled:cursor-wait"
                aria-label={isVisible ? "Tắt ảnh Sentinel-1" : "Bật ảnh Sentinel-1"}
            >
                <Satellite className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden />
                <span className="flex-1">
                    {isLoading ? "Đang tải Sentinel-1..." : "Earth Search SAR"}
                </span>
                {isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" aria-hidden />
                ) : (
                    <EyeOff className="w-3.5 h-3.5 text-gray-500" aria-hidden />
                )}
            </button>

            {/* Details — shown when active */}
            {isVisible && selectedLayer && (
                <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1.5">
                    {/* Metadata */}
                    <div className="text-[10px] text-gray-500 space-y-0.5">
                        <div>📡 {selectedLayer.platform.toUpperCase()} · {selectedLayer.instrumentMode}</div>
                        <div>🛰️ {selectedLayer.polarizations.join("/")} · {selectedLayer.orbitState}</div>
                        <div className="text-emerald-600">
                            Nguồn: Element 84 Earth Search STAC API
                        </div>
                    </div>

                    {/* Date selector */}
                    {layers && layers.length > 1 && (
                        <div>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 w-full text-[11px] text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronDown
                                    className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                                    aria-hidden
                                />
                                <span>
                                    {new Date(selectedLayer.datetime).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </button>

                            {expanded && (
                                <div className="mt-1 space-y-0.5 max-h-32 overflow-auto">
                                    {layers.map((l, i) => (
                                        <button
                                            key={l.id}
                                            onClick={() => {
                                                setSelectedIdx(i);
                                                setExpanded(false);
                                            }}
                                            className={`block w-full text-left px-2 py-1 rounded text-[11px] transition-colors
                        ${i === selectedIdx ? "bg-emerald-900/50 text-emerald-300" : "text-gray-400 hover:bg-gray-800"}`}
                                        >
                                            {new Date(l.datetime).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}{" "}
                                            <span className="text-gray-600">{l.platform}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
