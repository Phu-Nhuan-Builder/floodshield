import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Alerts list page — floodshield-main (with ElevenLabs voice alerts)
import { Bell, CheckCircle, Clock } from "lucide-react";
import { useAlerts, useAcknowledgeAlert } from "../hooks/useFloodData";
import { severityToLabel, formatVietnamDate, timeAgo } from "@floodshield/shared";
import { VoiceAlertButton } from "../components/alert/VoiceAlertButton";
function AlertCard({ alert }) {
    const { mutate: acknowledge, isPending } = useAcknowledgeAlert();
    const severityClass = {
        low: "badge-low",
        medium: "badge-medium",
        high: "badge-high",
        critical: "badge-critical",
    }[alert.severity];
    return (_jsx("div", { className: "card hover:border-gray-700 transition-colors", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [_jsx("span", { className: severityClass, children: severityToLabel(alert.severity) }), _jsxs("span", { className: "text-sm font-medium", children: [alert.district, ", ", alert.province] })] }), _jsx("p", { className: "text-sm text-gray-300 mb-2", children: alert.messageVi }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-500 flex-wrap", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3", "aria-hidden": true }), timeAgo(alert.createdAt)] }), _jsx("span", { children: formatVietnamDate(alert.createdAt) }), alert.notificationsSent > 0 && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Bell, { className: "w-3 h-3", "aria-hidden": true }), alert.notificationsSent, " th\u00F4ng b\u00E1o"] }))] })] }), _jsxs("div", { className: "flex flex-col gap-2 flex-shrink-0", children: [_jsx(VoiceAlertButton, { zoneId: alert.zoneId, province: alert.province, district: alert.district, severity: alert.severity, compact: true }), !alert.acknowledgedAt && (_jsxs("button", { onClick: () => acknowledge(alert.id), disabled: isPending, className: "btn-ghost text-xs", "aria-label": "X\u00E1c nh\u1EADn \u0111\u00E3 \u0111\u1ECDc c\u1EA3nh b\u00E1o", children: [_jsx(CheckCircle, { className: "w-4 h-4", "aria-hidden": true }), !isPending ? "Đã biết" : "..."] }))] })] }) }));
}
export function AlertsPage() {
    const { data: alerts, isLoading } = useAlerts();
    const active = alerts?.filter((a) => !a.acknowledgedAt) ?? [];
    const acknowledged = alerts?.filter((a) => a.acknowledgedAt) ?? [];
    return (_jsxs("div", { className: "p-4 max-w-3xl", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-xl font-bold", children: "C\u1EA3nh b\u00E1o l\u0169 l\u1EE5t" }), _jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [active.length, " c\u1EA3nh b\u00E1o \u0111ang ho\u1EA1t \u0111\u1ED9ng"] })] }), isLoading && (_jsx("div", { className: "space-y-3", children: [...Array(3)].map((_, i) => (_jsxs("div", { className: "card", children: [_jsx("div", { className: "skeleton h-4 w-32 mb-2" }), _jsx("div", { className: "skeleton h-4 w-full mb-1" }), _jsx("div", { className: "skeleton h-3 w-48" })] }, i))) })), active.length > 0 && (_jsxs("section", { className: "mb-6", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3", children: ["\u0110ang ho\u1EA1t \u0111\u1ED9ng (", active.length, ")"] }), _jsx("div", { className: "space-y-2", children: active.map((alert) => (_jsx(AlertCard, { alert: alert }, alert.id))) })] })), acknowledged.length > 0 && (_jsxs("section", { children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3", children: ["\u0110\u00E3 x\u1EED l\u00FD (", acknowledged.length, ")"] }), _jsx("div", { className: "space-y-2 opacity-60", children: acknowledged.slice(0, 10).map((alert) => (_jsx(AlertCard, { alert: alert }, alert.id))) })] })), !isLoading && !alerts?.length && (_jsxs("div", { className: "text-center py-12 text-gray-600", children: [_jsx(Bell, { className: "w-12 h-12 mx-auto mb-3 opacity-30", "aria-hidden": true }), _jsx("p", { children: "Kh\u00F4ng c\u00F3 c\u1EA3nh b\u00E1o n\u00E0o hi\u1EC7n t\u1EA1i" })] }))] }));
}
//# sourceMappingURL=AlertsPage.js.map