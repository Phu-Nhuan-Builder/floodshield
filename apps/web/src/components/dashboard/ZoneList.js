import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ZoneList sidebar component
import { useFloodZones } from "../../hooks/useFloodData";
import { useAppStore } from "../../stores/appStore";
import { severityToLabel, formatKm2, timeAgo } from "@floodshield/shared";
export function ZoneList() {
    const { data: zones, isLoading } = useFloodZones();
    const { selectedZoneId, setSelectedZoneId } = useAppStore();
    const sorted = zones?.slice().sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
    });
    return (_jsxs("div", { className: "card h-full flex flex-col", children: [_jsx("h2", { className: "font-semibold text-sm mb-3", children: "V\u00F9ng l\u0169 \u0111ang theo d\u00F5i" }), isLoading && (_jsx("div", { className: "space-y-2", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "skeleton h-16 rounded-lg" }, i))) })), _jsx("div", { className: "flex-1 overflow-auto space-y-1.5", role: "list", "aria-label": "Danh s\u00E1ch v\u00F9ng l\u0169", children: sorted?.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const severityColors = {
                        low: "border-l-yellow-400 bg-yellow-900/10",
                        medium: "border-l-amber-400 bg-amber-900/10",
                        high: "border-l-red-500 bg-red-900/10",
                        critical: "border-l-red-700 bg-red-950/20",
                    };
                    return (_jsxs("button", { onClick: () => setSelectedZoneId(isSelected ? null : zone.id), className: `
                w-full text-left p-2.5 rounded-lg border-l-2 transition-all
                hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-400
                ${severityColors[zone.severity]}
                ${isSelected ? "ring-1 ring-blue-500" : ""}
              `, role: "listitem", "aria-pressed": isSelected, "aria-label": `${zone.district}, ${zone.province} — ${severityToLabel(zone.severity)}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-1", children: [_jsxs("div", { className: "font-medium text-xs leading-tight", children: [zone.district, ", ", zone.province] }), _jsx("span", { className: "text-xs text-gray-500 flex-shrink-0", children: timeAgo(zone.detectedAt) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("span", { className: "text-xs text-gray-400", children: severityToLabel(zone.severity) }), _jsx("span", { className: "text-xs text-gray-600", children: "\u00B7" }), _jsx("span", { className: "text-xs text-gray-500", children: formatKm2(zone.floodedAreaKm2) })] })] }, zone.id));
                }) })] }));
}
//# sourceMappingURL=ZoneList.js.map