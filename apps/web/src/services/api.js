const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
async function apiFetch(path, init) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
    });
    const result = (await res.json());
    if (!res.ok || result.error !== null) {
        throw new Error(result.error?.message ?? `API error ${res.status}`);
    }
    return result.data;
}
// ── Flood Zones ──────────────────────────────────────────────────────────────
export async function getFloodZones() {
    return apiFetch("/flood/zones");
}
export async function getFloodZoneById(id) {
    return apiFetch(`/flood/zones/${id}`);
}
export async function getFloodStats() {
    return apiFetch("/flood/stats");
}
export async function triggerFloodScan() {
    return apiFetch("/flood/scan", { method: "POST" });
}
// ── Alerts ───────────────────────────────────────────────────────────────────
export async function getAlerts(active) {
    const qs = active !== undefined ? `?active=${active}` : "";
    return apiFetch(`/alerts${qs}`);
}
export async function acknowledgeAlert(alertId) {
    await apiFetch(`/alerts/${alertId}/acknowledge`, { method: "POST" });
}
// ── Payouts ──────────────────────────────────────────────────────────────────
export async function getPayouts(zoneId) {
    const qs = zoneId ? `?zoneId=${zoneId}` : "";
    return apiFetch(`/payouts${qs}`);
}
export async function triggerPayout(payload) {
    return apiFetch("/payouts/trigger", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
// ── Community Verification ────────────────────────────────────────────────────
export async function submitVerification(payload) {
    return apiFetch("/verify", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export async function getVerifications(zoneId) {
    return apiFetch(`/verify?zoneId=${zoneId}`);
}
//# sourceMappingURL=api.js.map