// Alerts list page — floodshield-main (with ElevenLabs voice alerts)
import { Bell, CheckCircle, Clock } from "lucide-react";
import { useAlerts, useAcknowledgeAlert } from "../hooks/useFloodData";
import { severityToLabel, formatVietnamDate, timeAgo } from "@floodshield/shared";
import type { FloodAlert } from "@floodshield/shared";
import { VoiceAlertButton } from "../components/alert/VoiceAlertButton";

function AlertCard({ alert }: { alert: FloodAlert }) {
  const { mutate: acknowledge, isPending } = useAcknowledgeAlert();

  const severityClass = {
    low: "badge-low",
    medium: "badge-medium",
    high: "badge-high",
    critical: "badge-critical",
  }[alert.severity];

  return (
    <div className="card hover:border-gray-700 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={severityClass}>{severityToLabel(alert.severity)}</span>
            <span className="text-sm font-medium">
              {alert.district}, {alert.province}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{alert.messageVi}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden />
              {timeAgo(alert.createdAt)}
            </span>
            <span>{formatVietnamDate(alert.createdAt)}</span>
            {alert.notificationsSent > 0 && (
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3" aria-hidden />
                {alert.notificationsSent} thông báo
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* 🎙 ElevenLabs voice alert button */}
          <VoiceAlertButton
            zoneId={alert.zoneId}
            province={alert.province}
            district={alert.district}
            severity={alert.severity}
            compact
          />
          {!alert.acknowledgedAt && (
            <button
              onClick={() => acknowledge(alert.id)}
              disabled={isPending}
              className="btn-ghost text-xs"
              aria-label="Xác nhận đã đọc cảnh báo"
            >
              <CheckCircle className="w-4 h-4" aria-hidden />
              {!isPending ? "Đã biết" : "..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();

  const active = alerts?.filter((a) => !a.acknowledgedAt) ?? [];
  const acknowledged = alerts?.filter((a) => a.acknowledgedAt) ?? [];

  return (
    <div className="p-4 max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Cảnh báo lũ lụt</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {active.length} cảnh báo đang hoạt động
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-4 w-full mb-1" />
              <div className="skeleton h-3 w-48" />
            </div>
          ))}
        </div>
      )}

      {/* Active alerts */}
      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Đang hoạt động ({active.length})
          </h2>
          <div className="space-y-2">
            {active.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {/* Acknowledged alerts */}
      {acknowledged.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Đã xử lý ({acknowledged.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {acknowledged.slice(0, 10).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && !alerts?.length && (
        <div className="text-center py-12 text-gray-600">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden />
          <p>Không có cảnh báo nào hiện tại</p>
        </div>
      )}
    </div>
  );
}
