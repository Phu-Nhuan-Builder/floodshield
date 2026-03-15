// Main Dashboard page — Map + Stats
import { FloodMap } from "../components/map/FloodMap";
import { StatsCards } from "../components/dashboard/StatsCards";
import { ZoneList } from "../components/dashboard/ZoneList";
import { useRealtimeFloodZones } from "../hooks/useFloodData";

export function DashboardPage() {
  // Enable realtime updates
  useRealtimeFloodZones();

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-auto">
      <div>
        <h1 className="text-xl font-bold">Bản đồ lũ lụt ĐBSCL</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Dữ liệu vệ tinh Sentinel-1 · Cập nhật mỗi 6-12 giờ
        </p>
      </div>

      {/* Stats row */}
      <StatsCards />

      {/* Map + zone list */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map — takes most space */}
        <div className="flex-1 min-h-[400px]">
          <FloodMap />
        </div>

        {/* Zone list sidebar */}
        <div className="w-72 flex-shrink-0 overflow-auto">
          <ZoneList />
        </div>
      </div>
    </div>
  );
}
