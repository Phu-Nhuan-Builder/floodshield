import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Map style toggle control
import { Map, Satellite, Globe } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
const STYLES = [
    { key: "dark", label: "Tối", icon: Globe },
    { key: "satellite", label: "Vệ tinh", icon: Satellite },
    { key: "streets", label: "Đường", icon: Map },
];
export function MapStyleToggle() {
    const { mapStyle, setMapStyle } = useAppStore();
    return (_jsx("div", { className: "flex flex-col gap-1 card p-1.5", role: "group", "aria-label": "Ch\u1ECDn ki\u1EC3u b\u1EA3n \u0111\u1ED3", children: STYLES.map(({ key, label, icon: Icon }) => (_jsxs("button", { onClick: () => setMapStyle(key), className: `
            flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px]
            ${mapStyle === key ? "bg-blue-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}
          `, "aria-label": `Kiểu bản đồ: ${label}`, "aria-pressed": mapStyle === key, children: [_jsx(Icon, { className: "w-3.5 h-3.5 flex-shrink-0", "aria-hidden": true }), label] }, key))) }));
}
//# sourceMappingURL=MapStyleToggle.js.map