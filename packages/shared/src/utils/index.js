import { FLOOD_THRESHOLDS } from "../constants/index.js";
// ── Severity helpers ─────────────────────────────────────────────────────────
export function getSeverityFromFraction(fraction) {
    if (fraction >= FLOOD_THRESHOLDS.FRACTION_HIGH)
        return "critical";
    if (fraction >= FLOOD_THRESHOLDS.FRACTION_MEDIUM)
        return "high";
    if (fraction >= FLOOD_THRESHOLDS.FRACTION_LOW)
        return "medium";
    return "low";
}
export function severityToColor(severity) {
    switch (severity) {
        case "low": return "#FFF176";
        case "medium": return "#FFB300";
        case "high": return "#F44336";
        case "critical": return "#B71C1C";
    }
}
export function severityToLabel(severity) {
    switch (severity) {
        case "low": return "Thấp";
        case "medium": return "Trung bình";
        case "high": return "Cao";
        case "critical": return "Nghiêm trọng";
    }
}
// ── Date helpers ─────────────────────────────────────────────────────────────
export function formatDateRange(days) {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return `${start.toISOString().split("T")[0]}/${end.toISOString().split("T")[0]}`;
}
export function formatVietnamDate(iso) {
    return new Date(iso).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function timeAgo(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1)
        return "vừa xong";
    if (diffMin < 60)
        return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24)
        return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
}
// ── Alert message generators ─────────────────────────────────────────────────
export function generateAlertMessage(district, province, severity) {
    const labels = {
        low: `Mực nước tại ${district}, ${province} đang dâng cao. Cần chú ý.`,
        medium: `Cảnh báo lũ tại ${district}, ${province}. Hãy di chuyển gia súc và tài sản lên cao.`,
        high: `CẢNH BÁO KHẨN: Lũ đang vượt ngưỡng nguy hiểm tại ${district}, ${province}. Sẵn sàng di tản!`,
        critical: `KHẨN CẤP! Lũ nghiêm trọng tại ${district}, ${province}. DI TẢN NGAY LẬP TỨC! Liên hệ 113.`,
    };
    return labels[severity];
}
// ── CSS class helpers ────────────────────────────────────────────────────────
export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
// ── Number formatters ────────────────────────────────────────────────────────
export function formatKm2(km2) {
    if (km2 >= 1000)
        return `${(km2 / 1000).toFixed(1)}k km²`;
    return `${km2.toFixed(1)} km²`;
}
export function formatSolAmount(lamports) {
    return `${(lamports / 1_000_000_000).toFixed(4)} SOL`;
}
export function truncateAddress(address, chars = 4) {
    if (address.length <= chars * 2 + 3)
        return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
//# sourceMappingURL=index.js.map