// Critical flood alert banner
import { AlertTriangle, X } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { useAcknowledgeAlert } from "../../hooks/useFloodData";
import type { FloodAlert } from "@floodshield/shared";
import { severityToLabel } from "@floodshield/shared";

interface AlertBannerProps {
  alert: FloodAlert;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  const dismissAlert = useAppStore((s) => s.dismissAlert);
  const { mutate: acknowledge } = useAcknowledgeAlert();

  const dismiss = () => {
    dismissAlert(alert.id);
    acknowledge(alert.id);
  };

  return (
    <div
      className="alert-banner flex items-start gap-3 px-4 py-3 bg-red-950 border-b border-red-800"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AlertTriangle
        className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse"
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-red-200 text-sm">
          CẢNH BÁO LŨ — {severityToLabel(alert.severity).toUpperCase()}
        </div>
        <div className="text-red-300 text-sm mt-0.5">{alert.messageVi}</div>
      </div>
      <button
        onClick={dismiss}
        className="p-1 rounded hover:bg-red-900 transition-colors flex-shrink-0"
        aria-label="Đóng cảnh báo"
      >
        <X className="w-4 h-4 text-red-400" aria-hidden />
      </button>
    </div>
  );
}
