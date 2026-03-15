// Map style toggle control
import { Map, Satellite, Globe } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

const STYLES = [
  { key: "dark" as const, label: "Tối", icon: Globe },
  { key: "satellite" as const, label: "Vệ tinh", icon: Satellite },
  { key: "streets" as const, label: "Đường", icon: Map },
];

export function MapStyleToggle() {
  const { mapStyle, setMapStyle } = useAppStore();

  return (
    <div className="flex flex-col gap-1 card p-1.5" role="group" aria-label="Chọn kiểu bản đồ">
      {STYLES.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setMapStyle(key)}
          className={`
            flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px]
            ${mapStyle === key ? "bg-blue-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}
          `}
          aria-label={`Kiểu bản đồ: ${label}`}
          aria-pressed={mapStyle === key}
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
