// Community verification page
import { useState } from "react";
import { Camera, MapPin, CheckSquare, Loader2 } from "lucide-react";
import { useSubmitVerification, useFloodZones } from "../hooks/useFloodData";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../services/supabase";
import type { FloodSeverity } from "@floodshield/shared";

const SEVERITY_OPTIONS: Array<{ value: FloodSeverity; label: string }> = [
  { value: "low", label: "Thấp — nước dâng nhẹ" },
  { value: "medium", label: "Trung bình — ngập đến gối" },
  { value: "high", label: "Cao — ngập đến ngực" },
  { value: "critical", label: "Nghiêm trọng — nguy hiểm tính mạng" },
];

export function VerifyPage() {
  const { data: zones } = useFloodZones();
  const { mutate: submit, isPending, isSuccess } = useSubmitVerification();
  const { isConnected } = useWallet();

  const [form, setForm] = useState({
    zoneId: "",
    observedSeverity: "medium" as FloodSeverity,
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gps, setGps] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setUploadError("Không thể lấy vị trí GPS. Vui lòng cho phép truy cập vị trí.");
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!imageFile || !gps || !form.zoneId) return;

    // Upload image to Supabase Storage
    const fileName = `verify_${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("verifications")
      .upload(fileName, imageFile, { contentType: imageFile.type });

    if (uploadErr || !uploadData) {
      setUploadError("Lỗi tải ảnh. Thử lại sau.");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("verifications")
      .getPublicUrl(uploadData.path);

    submit({
      zoneId: form.zoneId,
      imageUrl: publicUrl,
      gpsLat: gps.lat,
      gpsLon: gps.lon,
      observedSeverity: form.observedSeverity,
      notes: form.notes,
    });
  };

  return (
    <div className="p-4 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Xác nhận cộng đồng</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Giúp cải thiện độ chính xác bằng cách chia sẻ ảnh và GPS từ thực địa
        </p>
      </div>

      {isSuccess ? (
        <div
          className="card border-green-800 bg-green-950/30 text-center py-8"
          role="status"
          aria-live="polite"
        >
          <CheckSquare className="w-12 h-12 text-green-400 mx-auto mb-3" aria-hidden />
          <p className="font-semibold text-green-300">Xác nhận đã được ghi nhận!</p>
          <p className="text-sm text-gray-500 mt-1">
            Dữ liệu của bạn sẽ được xem xét và cập nhật vào hệ thống.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Zone select */}
          <div className="card">
            <label className="text-xs text-gray-400 mb-1.5 block font-medium" htmlFor="verify-zone">
              Vùng lũ cần xác nhận *
            </label>
            <select
              id="verify-zone"
              value={form.zoneId}
              onChange={(e) => setForm((f) => ({ ...f, zoneId: e.target.value }))}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn vùng lũ để xác nhận...</option>
              {zones?.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.district}, {z.province}
                </option>
              ))}
            </select>
          </div>

          {/* Image upload */}
          <div className="card">
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Ảnh thực địa *
            </label>
            <div className="flex items-start gap-3">
              <label className="btn-ghost cursor-pointer" aria-label="Chọn ảnh từ thiết bị">
                <Camera className="w-4 h-4" aria-hidden />
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleImageChange}
                  required
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Ảnh đã chọn"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                />
              )}
            </div>
          </div>

          {/* GPS */}
          <div className="card">
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Vị trí GPS *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={getGPS}
                disabled={gpsLoading}
                className="btn-ghost text-sm"
                aria-label="Lấy vị trí GPS hiện tại"
              >
                {gpsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : (
                  <MapPin className="w-4 h-4" aria-hidden />
                )}
                {gpsLoading ? "Đang lấy vị trí..." : "Lấy vị trí GPS"}
              </button>
              {gps && (
                <span className="text-xs text-green-400 font-mono">
                  {gps.lat.toFixed(6)}, {gps.lon.toFixed(6)}
                </span>
              )}
            </div>
          </div>

          {/* Severity */}
          <div className="card">
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Mức độ lũ quan sát được *
            </label>
            <div className="space-y-2" role="radiogroup" aria-label="Chọn mức độ lũ">
              {SEVERITY_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="radio"
                    name="severity"
                    value={value}
                    checked={form.observedSeverity === value}
                    onChange={() => setForm((f) => ({ ...f, observedSeverity: value }))}
                    className="accent-blue-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <label className="text-xs text-gray-400 mb-1.5 block font-medium" htmlFor="notes">
              Ghi chú thêm
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Mô tả tình trạng lũ, thiệt hại, số hộ bị ảnh hưởng..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {uploadError && (
            <p className="text-sm text-red-400" role="alert">
              {uploadError}
            </p>
          )}

          {!isConnected && (
            <p className="text-sm text-yellow-500">
              ⚠ Kết nối ví để xác nhận on-chain (không bắt buộc)
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !imageFile || !gps || !form.zoneId}
            className="btn-primary w-full"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <CheckSquare className="w-4 h-4" aria-hidden />
            )}
            {isPending ? "Đang gửi..." : "Gửi xác nhận"}
          </button>
        </form>
      )}
    </div>
  );
}
