// Flood severity legend
export function MapLegend() {
  const items = [
    { color: "#B71C1C", label: "Nghiêm trọng", desc: ">20% diện tích" },
    { color: "#F44336", label: "Cao", desc: "8–20%" },
    { color: "#FFB300", label: "Trung bình", desc: "2–8%" },
    { color: "#FFF176", label: "Thấp", desc: "<2%" },
  ];

  return (
    <div className="card p-3 min-w-[160px]" role="legend" aria-label="Chú giải mức độ lũ">
      <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
        Mức độ lũ
      </div>
      <div className="space-y-1.5">
        {items.map(({ color, label, desc }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <div>
              <div className="text-xs font-medium text-gray-200">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
