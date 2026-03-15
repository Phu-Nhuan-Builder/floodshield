import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Flood severity legend
export function MapLegend() {
    const items = [
        { color: "#B71C1C", label: "Nghiêm trọng", desc: ">20% diện tích" },
        { color: "#F44336", label: "Cao", desc: "8–20%" },
        { color: "#FFB300", label: "Trung bình", desc: "2–8%" },
        { color: "#FFF176", label: "Thấp", desc: "<2%" },
    ];
    return (_jsxs("div", { className: "card p-3 min-w-[160px]", role: "legend", "aria-label": "Ch\u00FA gi\u1EA3i m\u1EE9c \u0111\u1ED9 l\u0169", children: [_jsx("div", { className: "text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide", children: "M\u1EE9c \u0111\u1ED9 l\u0169" }), _jsx("div", { className: "space-y-1.5", children: items.map(({ color, label, desc }) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-sm flex-shrink-0", style: { backgroundColor: color }, "aria-hidden": true }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-medium text-gray-200", children: label }), _jsx("div", { className: "text-xs text-gray-500", children: desc })] })] }, label))) })] }));
}
//# sourceMappingURL=MapLegend.js.map