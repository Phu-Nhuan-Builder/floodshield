import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Main Dashboard page — Map + Stats
import { FloodMap } from "../components/map/FloodMap";
import { StatsCards } from "../components/dashboard/StatsCards";
import { ZoneList } from "../components/dashboard/ZoneList";
import { useRealtimeFloodZones } from "../hooks/useFloodData";
export function DashboardPage() {
    // Enable realtime updates
    useRealtimeFloodZones();
    return (_jsxs("div", { className: "flex flex-col h-full p-4 gap-4 overflow-auto", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "B\u1EA3n \u0111\u1ED3 l\u0169 l\u1EE5t \u0110BSCL" }), _jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "D\u1EEF li\u1EC7u v\u1EC7 tinh Sentinel-1 \u00B7 C\u1EADp nh\u1EADt m\u1ED7i 6-12 gi\u1EDD" })] }), _jsx(StatsCards, {}), _jsxs("div", { className: "flex-1 flex gap-4 min-h-0", children: [_jsx("div", { className: "flex-1 min-h-[400px]", children: _jsx(FloodMap, {}) }), _jsx("div", { className: "w-72 flex-shrink-0 overflow-auto", children: _jsx(ZoneList, {}) })] })] }));
}
//# sourceMappingURL=DashboardPage.js.map