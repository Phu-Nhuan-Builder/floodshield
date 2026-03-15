import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Critical flood alert banner
import { AlertTriangle, X } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { useAcknowledgeAlert } from "../../hooks/useFloodData";
import { severityToLabel } from "@floodshield/shared";
export function AlertBanner({ alert }) {
    const dismissAlert = useAppStore((s) => s.dismissAlert);
    const { mutate: acknowledge } = useAcknowledgeAlert();
    const dismiss = () => {
        dismissAlert(alert.id);
        acknowledge(alert.id);
    };
    return (_jsxs("div", { className: "alert-banner flex items-start gap-3 px-4 py-3 bg-red-950 border-b border-red-800", role: "alert", "aria-live": "assertive", "aria-atomic": "true", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse", "aria-hidden": true }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "font-semibold text-red-200 text-sm", children: ["C\u1EA2NH B\u00C1O L\u0168 \u2014 ", severityToLabel(alert.severity).toUpperCase()] }), _jsx("div", { className: "text-red-300 text-sm mt-0.5", children: alert.messageVi })] }), _jsx("button", { onClick: dismiss, className: "p-1 rounded hover:bg-red-900 transition-colors flex-shrink-0", "aria-label": "\u0110\u00F3ng c\u1EA3nh b\u00E1o", children: _jsx(X, { className: "w-4 h-4 text-red-400", "aria-hidden": true }) })] }));
}
//# sourceMappingURL=AlertBanner.js.map