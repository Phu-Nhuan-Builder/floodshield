// API service — calls Cloudflare Worker backend
import type { FloodZone, FloodAlert, AidPayout, FloodStats, CommunityVerification, ApiResult } from "@floodshield/shared";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  const result = (await res.json()) as ApiResult<T>;

  if (!res.ok || result.error !== null) {
    throw new Error(
      result.error?.message ?? `API error ${res.status}`,
    );
  }

  return result.data as T;
}

// ── Flood Zones ──────────────────────────────────────────────────────────────

export async function getFloodZones(): Promise<FloodZone[]> {
  return apiFetch<FloodZone[]>("/flood/zones");
}

export async function getFloodZoneById(id: string): Promise<FloodZone> {
  return apiFetch<FloodZone>(`/flood/zones/${id}`);
}

export async function getFloodStats(): Promise<FloodStats> {
  return apiFetch<FloodStats>("/flood/stats");
}

export async function triggerFloodScan(): Promise<{ jobId: string }> {
  return apiFetch<{ jobId: string }>("/flood/scan", { method: "POST" });
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(active?: boolean): Promise<FloodAlert[]> {
  const qs = active !== undefined ? `?active=${active}` : "";
  return apiFetch<FloodAlert[]>(`/alerts${qs}`);
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  await apiFetch(`/alerts/${alertId}/acknowledge`, { method: "POST" });
}

// ── Payouts ──────────────────────────────────────────────────────────────────

export async function getPayouts(zoneId?: string): Promise<AidPayout[]> {
  const qs = zoneId ? `?zoneId=${zoneId}` : "";
  return apiFetch<AidPayout[]>(`/payouts${qs}`);
}

export async function triggerPayout(payload: {
  zoneId: string;
  recipientAddress: string;
  aidType: AidPayout["aidType"];
}): Promise<AidPayout> {
  return apiFetch<AidPayout>("/payouts/trigger", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Community Verification ────────────────────────────────────────────────────

export async function submitVerification(payload: {
  zoneId: string;
  imageUrl: string;
  gpsLat: number;
  gpsLon: number;
  observedSeverity: string;
  notes: string;
}): Promise<CommunityVerification> {
  return apiFetch<CommunityVerification>("/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getVerifications(zoneId: string): Promise<CommunityVerification[]> {
  return apiFetch<CommunityVerification[]>(`/verify?zoneId=${zoneId}`);
}
