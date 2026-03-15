import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Voice Alert Button — plays ElevenLabs TTS audio for a flood zone
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useVoiceAlert } from "../../hooks/useVoiceAlert";
export function VoiceAlertButton({ zoneId, province, district, severity, compact, }) {
    const { isPlaying, isLoading, error, source, playZoneAlert, stop } = useVoiceAlert();
    const handleClick = () => {
        if (isPlaying || isLoading) {
            stop();
            return;
        }
        playZoneAlert(zoneId);
    };
    const severityBorderColors = {
        low: "border-yellow-700 hover:border-yellow-500",
        medium: "border-amber-700 hover:border-amber-500",
        high: "border-red-700 hover:border-red-500",
        critical: "border-red-800 hover:border-red-600",
    };
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: handleClick, className: `
          inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
          transition-all min-h-[44px]
          ${isPlaying
                    ? "bg-red-900/30 border-red-600 text-red-300"
                    : `bg-gray-900 ${severityBorderColors[severity]} text-gray-300 hover:text-white`}
        `, "aria-label": isPlaying ? "Dừng phát âm thanh cảnh báo" : `Phát cảnh báo lũ tại ${district}, ${province}`, "aria-pressed": isPlaying, children: [isLoading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": true })) : isPlaying ? (_jsx(VolumeX, { className: "w-4 h-4", "aria-hidden": true })) : (_jsx(Volume2, { className: "w-4 h-4", "aria-hidden": true })), !compact && (_jsx("span", { children: isLoading ? "Đang tải..." : isPlaying ? "Dừng" : "Nghe cảnh báo" }))] }), source && !compact && (_jsx("span", { className: "text-xs text-gray-600", children: source === "elevenlabs" ? "🎙 ElevenLabs" : "🔊 Trình duyệt" })), error && (_jsx("span", { className: "text-xs text-red-500", role: "alert", children: error }))] }));
}
//# sourceMappingURL=VoiceAlertButton.js.map