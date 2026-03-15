import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Community verification page
import { useState } from "react";
import { Camera, MapPin, CheckSquare, Loader2 } from "lucide-react";
import { useSubmitVerification, useFloodZones } from "../hooks/useFloodData";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../services/supabase";
const SEVERITY_OPTIONS = [
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
        observedSeverity: "medium",
        notes: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [gps, setGps] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };
    const getGPS = () => {
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition((pos) => {
            setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            setGpsLoading(false);
        }, () => {
            setGpsLoading(false);
            setUploadError("Không thể lấy vị trí GPS. Vui lòng cho phép truy cập vị trí.");
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadError(null);
        if (!imageFile || !gps || !form.zoneId)
            return;
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
    return (_jsxs("div", { className: "p-4 max-w-2xl", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-xl font-bold", children: "X\u00E1c nh\u1EADn c\u1ED9ng \u0111\u1ED3ng" }), _jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Gi\u00FAp c\u1EA3i thi\u1EC7n \u0111\u1ED9 ch\u00EDnh x\u00E1c b\u1EB1ng c\u00E1ch chia s\u1EBB \u1EA3nh v\u00E0 GPS t\u1EEB th\u1EF1c \u0111\u1ECBa" })] }), isSuccess ? (_jsxs("div", { className: "card border-green-800 bg-green-950/30 text-center py-8", role: "status", "aria-live": "polite", children: [_jsx(CheckSquare, { className: "w-12 h-12 text-green-400 mx-auto mb-3", "aria-hidden": true }), _jsx("p", { className: "font-semibold text-green-300", children: "X\u00E1c nh\u1EADn \u0111\u00E3 \u0111\u01B0\u1EE3c ghi nh\u1EADn!" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "D\u1EEF li\u1EC7u c\u1EE7a b\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c xem x\u00E9t v\u00E0 c\u1EADp nh\u1EADt v\u00E0o h\u1EC7 th\u1ED1ng." })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "card", children: [_jsx("label", { className: "text-xs text-gray-400 mb-1.5 block font-medium", htmlFor: "verify-zone", children: "V\u00F9ng l\u0169 c\u1EA7n x\u00E1c nh\u1EADn *" }), _jsxs("select", { id: "verify-zone", value: form.zoneId, onChange: (e) => setForm((f) => ({ ...f, zoneId: e.target.value })), className: "w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Ch\u1ECDn v\u00F9ng l\u0169 \u0111\u1EC3 x\u00E1c nh\u1EADn..." }), zones?.map((z) => (_jsxs("option", { value: z.id, children: [z.district, ", ", z.province] }, z.id)))] })] }), _jsxs("div", { className: "card", children: [_jsx("label", { className: "text-xs text-gray-400 mb-1.5 block font-medium", children: "\u1EA2nh th\u1EF1c \u0111\u1ECBa *" }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsxs("label", { className: "btn-ghost cursor-pointer", "aria-label": "Ch\u1ECDn \u1EA3nh t\u1EEB thi\u1EBFt b\u1ECB", children: [_jsx(Camera, { className: "w-4 h-4", "aria-hidden": true }), "Ch\u1ECDn \u1EA3nh", _jsx("input", { type: "file", accept: "image/*", capture: "environment", className: "sr-only", onChange: handleImageChange, required: true })] }), imagePreview && (_jsx("img", { src: imagePreview, alt: "\u1EA2nh \u0111\u00E3 ch\u1ECDn", className: "w-24 h-24 object-cover rounded-lg border border-gray-700" }))] })] }), _jsxs("div", { className: "card", children: [_jsx("label", { className: "text-xs text-gray-400 mb-1.5 block font-medium", children: "V\u1ECB tr\u00ED GPS *" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { type: "button", onClick: getGPS, disabled: gpsLoading, className: "btn-ghost text-sm", "aria-label": "L\u1EA5y v\u1ECB tr\u00ED GPS hi\u1EC7n t\u1EA1i", children: [gpsLoading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": true })) : (_jsx(MapPin, { className: "w-4 h-4", "aria-hidden": true })), gpsLoading ? "Đang lấy vị trí..." : "Lấy vị trí GPS"] }), gps && (_jsxs("span", { className: "text-xs text-green-400 font-mono", children: [gps.lat.toFixed(6), ", ", gps.lon.toFixed(6)] }))] })] }), _jsxs("div", { className: "card", children: [_jsx("label", { className: "text-xs text-gray-400 mb-1.5 block font-medium", children: "M\u1EE9c \u0111\u1ED9 l\u0169 quan s\u00E1t \u0111\u01B0\u1EE3c *" }), _jsx("div", { className: "space-y-2", role: "radiogroup", "aria-label": "Ch\u1ECDn m\u1EE9c \u0111\u1ED9 l\u0169", children: SEVERITY_OPTIONS.map(({ value, label }) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors", children: [_jsx("input", { type: "radio", name: "severity", value: value, checked: form.observedSeverity === value, onChange: () => setForm((f) => ({ ...f, observedSeverity: value })), className: "accent-blue-500" }), _jsx("span", { className: "text-sm", children: label })] }, value))) })] }), _jsxs("div", { className: "card", children: [_jsx("label", { className: "text-xs text-gray-400 mb-1.5 block font-medium", htmlFor: "notes", children: "Ghi ch\u00FA th\u00EAm" }), _jsx("textarea", { id: "notes", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 3, placeholder: "M\u00F4 t\u1EA3 t\u00ECnh tr\u1EA1ng l\u0169, thi\u1EC7t h\u1EA1i, s\u1ED1 h\u1ED9 b\u1ECB \u1EA3nh h\u01B0\u1EDFng...", className: "w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" })] }), uploadError && (_jsx("p", { className: "text-sm text-red-400", role: "alert", children: uploadError })), !isConnected && (_jsx("p", { className: "text-sm text-yellow-500", children: "\u26A0 K\u1EBFt n\u1ED1i v\u00ED \u0111\u1EC3 x\u00E1c nh\u1EADn on-chain (kh\u00F4ng b\u1EAFt bu\u1ED9c)" })), _jsxs("button", { type: "submit", disabled: isPending || !imageFile || !gps || !form.zoneId, className: "btn-primary w-full", children: [isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": true })) : (_jsx(CheckSquare, { className: "w-4 h-4", "aria-hidden": true })), isPending ? "Đang gửi..." : "Gửi xác nhận"] })] }))] }));
}
//# sourceMappingURL=VerifyPage.js.map