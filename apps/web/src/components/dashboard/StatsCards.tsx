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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Thống kê tổng quan">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="card">
          <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} aria-hidden />
          </div>
          {isLoading ? (
            <div className="skeleton h-7 w-16 mb-1" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
      ))}
      {stats && (
        <div className="col-span-full text-xs text-gray-600 text-right">
          Cập nhật lần cuối: {timeAgo(stats.lastUpdated)}
        </div>
      )}
    </div>
  );
}
