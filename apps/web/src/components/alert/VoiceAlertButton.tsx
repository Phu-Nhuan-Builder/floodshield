// Voice Alert Button — plays ElevenLabs TTS audio for a flood zone
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useVoiceAlert } from "../../hooks/useVoiceAlert";
import type { FloodSeverity } from "@floodshield/shared";

interface VoiceAlertButtonProps {
  zoneId: string;
  province: string;
  district: string;
  severity: FloodSeverity;
  compact?: boolean;
}

export function VoiceAlertButton({
  zoneId,
  province,
  district,
  severity,
  compact,
}: VoiceAlertButtonProps) {
  const { isPlaying, isLoading, error, source, playZoneAlert, stop } =
    useVoiceAlert();

  const handleClick = () => {
    if (isPlaying || isLoading) {
      stop();
      return;
    }
    playZoneAlert(zoneId);
  };

  const severityBorderColors = {
    low:      "border-yellow-700 hover:border-yellow-500",
    medium:   "border-amber-700 hover:border-amber-500",
    high:     "border-red-700 hover:border-red-500",
    critical: "border-red-800 hover:border-red-600",
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
          transition-all min-h-[44px]
          ${isPlaying
            ? "bg-red-900/30 border-red-600 text-red-300"
            : `bg-gray-900 ${severityBorderColors[severity]} text-gray-300 hover:text-white`
          }
        `}
        aria-label={isPlaying ? "Dừng phát âm thanh cảnh báo" : `Phát cảnh báo lũ tại ${district}, ${province}`}
        aria-pressed={isPlaying}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : isPlaying ? (
          <VolumeX className="w-4 h-4" aria-hidden />
        ) : (
          <Volume2 className="w-4 h-4" aria-hidden />
        )}
        {!compact && (
          <span>
            {isLoading ? "Đang tải..." : isPlaying ? "Dừng" : "Nghe cảnh báo"}
          </span>
        )}
      </button>

      {/* Source indicator */}
      {source && !compact && (
        <span className="text-xs text-gray-600">
          {source === "elevenlabs" ? "🎙 ElevenLabs" : "🔊 Trình duyệt"}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-500" role="alert">{error}</span>
      )}
    </div>
  );
}
