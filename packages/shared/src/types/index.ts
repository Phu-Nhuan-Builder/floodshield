// FloodShield VN — Shared Types
// Used by both apps/web and packages/worker

export type FloodSeverity = "low" | "medium" | "high" | "critical";

export interface FloodZone {
  id: string;
  province: string;
  district: string;
  severity: FloodSeverity;
  floodIndex: number; // 0.0–1.0
  floodedAreaKm2: number;
  detectedAt: string; // ISO 8601
  sentinelItemId: string;
  geometry: GeoJSONPolygon;
  confidence: number; // 0–100
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface FloodGeoJSONFeature {
  type: "Feature";
  id: string;
  geometry: GeoJSONPolygon;
  properties: {
    province: string;
    district: string;
    severity: FloodSeverity;
    floodIndex: number;
    floodedAreaKm2: number;
    detectedAt: string;
    confidence: number;
  };
}

export interface FloodAlert {
  id: string;
  zoneId: string;
  province: string;
  district: string;
  severity: FloodSeverity;
  message: string;
  messageVi: string;
  createdAt: string;
  expiresAt: string;
  notificationsSent: number;
  acknowledgedAt?: string;
}

export interface AidPayout {
  id: string;
  zoneId: string;
  province: string;
  recipientAddress: string;
  recipientName: string;
  amount: number; // SOL lamports
  aidType: "rice_voucher" | "fertilizer_voucher" | "cash";
  txSignature: string | null;
  status: "pending" | "processing" | "confirmed" | "failed";
  triggeredAt: string;
  confirmedAt?: string;
  blockHeight?: number;
}

export interface CommunityVerification {
  id: string;
  zoneId: string;
  submitterAddress: string;
  submitterName: string;
  imageUrl: string;
  gpsLat: number;
  gpsLon: number;
  observedSeverity: FloodSeverity;
  notes: string;
  verifiedAt: string;
  onChainSignature?: string;
}

export interface ProvinceInfo {
  id: string;
  name: string;
  nameVi: string;
  code: string;
  bbox: [number, number, number, number];
  population: number;
  farmersCount: number;
}

export interface FloodStats {
  totalZones: number;
  criticalZones: number;
  highZones: number;
  mediumZones: number;
  lowZones: number;
  totalAffectedKm2: number;
  totalPayoutsTriggered: number;
  totalPayoutsConfirmed: number;
  lastUpdated: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  error: null;
  timestamp: string;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Sentinel-1 STAC types
export interface STACSearchRequest {
  collections: string[];
  bbox: [number, number, number, number];
  datetime: string;
  limit: number;
  sortby?: Array<{ field: string; direction: "asc" | "desc" }>;
}

export interface STACItem {
  id: string;
  type: "Feature";
  bbox: number[];
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: {
    datetime: string;
    platform: string;
    "sar:polarizations": string[];
    "sar:frequency_band": string;
    "sar:instrument_mode": string;
  };
  assets: {
    // Earth Search v1 returns lowercase keys
    vv?: { href: string; type: string };
    vh?: { href: string; type: string };
    // Legacy uppercase keys (kept for compat)
    VV?: { href: string; type: string };
    VH?: { href: string; type: string };
    thumbnail?: { href: string };
    // Allow arbitrary asset keys from real STAC responses
    [key: string]: { href: string; type?: string } | undefined;
  };
  links: Array<{ rel: string; href: string; type?: string }>;
}
