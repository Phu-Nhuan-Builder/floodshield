import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Stats cards for dashboard
import { Activity, AlertTriangle, DollarSign, Map } from "lucide-react";
import { useFloodStats } from "../../hooks/useFloodData";
import { formatKm2, timeAgo } from "@floodshield/shared";
export function StatsCards() {
    const { data: stats, isLoading } = useFloodStats();
    const cards = [
        {
            label: "Vùng đang theo dõi",
            value: stats?.totalZones ?? 0,
            icon: Map,
            color: "text-blue-400",
            bg: "bg-blue-900/20",
        },
        {
            label: "Cảnh báo khẩn cấp",
            value: (stats?.criticalZones ?? 0) + (stats?.highZones ?? 0),
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-900/20",
        },
        {
            label: "Diện tích bị ngập",
            value: stats ? formatKm2(stats.totalAffectedKm2) : "—",
            icon: Activity,
            color: "text-amber-400",
            bg: "bg-amber-900/20",
        },
        {
            label: "Viện trợ đã xác nhận",
            value: stats?.totalPayoutsConfirmed ?? 0,
            icon: DollarSign,
            color: "text-green-400",
            bg: "bg-green-900/20",
        },
    ];
    return (_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", role: "region", "aria-label": "Th\u1ED1ng k\u00EA t\u1ED5ng quan", children: [cards.map(({ label, value, icon: Icon, color, bg }) => (_jsxs("div", { className: "card", children: [_jsx("div", { className: `inline-flex p-2 rounded-lg ${bg} mb-3`, children: _jsx(Icon, { className: `w-5 h-5 ${color}`, "aria-hidden": true }) }), isLoading ? (_jsx("div", { className: "skeleton h-7 w-16 mb-1" })) : (_jsx("div", { className: "text-2xl font-bold", children: value })), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: label })] }, label))), stats && (_jsxs("div", { className: "col-span-full text-xs text-gray-600 text-right", children: ["C\u1EADp nh\u1EADt l\u1EA7n cu\u1ED1i: ", timeAgo(stats.lastUpdated)] }))] }));
}
//# sourceMappingURL=StatsCards.js.map