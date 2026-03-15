// Demo mode banner — shown when using historical data
import { Info } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 bg-blue-950 border-b border-blue-800 text-blue-300 text-sm"
      role="status"
      aria-live="polite"
    >
      <Info className="w-4 h-4 flex-shrink-0" aria-hidden />
      <span>
        <strong>Chế độ demo:</strong> Đang hiển thị dữ liệu lũ lịch sử tháng 8/2024 (Sentinel-1
        revisit cycle 6-12 ngày). Dữ liệu thời gian thực sẽ cập nhật khi vệ tinh quét tiếp.
      </span>
    </div>
  );
}
