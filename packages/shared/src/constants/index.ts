// ĐBSCL — Đồng bằng sông Cửu Long constants
export const MEKONG_BBOX: [number, number, number, number] = [103.5, 8.5, 106.5, 11.5];
export const MEKONG_CENTER: [number, number] = [105.0, 10.0];
export const MEKONG_DEFAULT_ZOOM = 7;

export const MEKONG_PROVINCES = [
  { id: "an-giang", name: "An Giang", nameVi: "An Giang", code: "89", bbox: [104.79, 10.24, 105.58, 10.95] as [number, number, number, number], population: 1900000, farmersCount: 380000 },
  { id: "dong-thap", name: "Dong Thap", nameVi: "Đồng Tháp", code: "87", bbox: [105.29, 10.19, 106.09, 10.89] as [number, number, number, number], population: 1700000, farmersCount: 320000 },
  { id: "long-an", name: "Long An", nameVi: "Long An", code: "80", bbox: [105.56, 10.38, 106.87, 11.06] as [number, number, number, number], population: 1700000, farmersCount: 290000 },
  { id: "tien-giang", name: "Tien Giang", nameVi: "Tiền Giang", code: "82", bbox: [105.69, 10.18, 106.59, 10.72] as [number, number, number, number], population: 1700000, farmersCount: 310000 },
  { id: "ben-tre", name: "Ben Tre", nameVi: "Bến Tre", code: "83", bbox: [105.83, 9.96, 106.79, 10.35] as [number, number, number, number], population: 1250000, farmersCount: 220000 },
  { id: "vinh-long", name: "Vinh Long", nameVi: "Vĩnh Long", code: "86", bbox: [105.54, 9.85, 106.18, 10.40] as [number, number, number, number], population: 1050000, farmersCount: 200000 },
  { id: "tra-vinh", name: "Tra Vinh", nameVi: "Trà Vinh", code: "84", bbox: [105.85, 9.62, 106.74, 10.17] as [number, number, number, number], population: 1000000, farmersCount: 190000 },
  { id: "soc-trang", name: "Soc Trang", nameVi: "Sóc Trăng", code: "94", bbox: [105.53, 9.19, 106.21, 9.85] as [number, number, number, number], population: 1200000, farmersCount: 230000 },
  { id: "hau-giang", name: "Hau Giang", nameVi: "Hậu Giang", code: "93", bbox: [105.28, 9.43, 105.96, 10.05] as [number, number, number, number], population: 770000, farmersCount: 150000 },
  { id: "can-tho", name: "Can Tho", nameVi: "Cần Thơ", code: "92", bbox: [105.26, 9.84, 105.91, 10.30] as [number, number, number, number], population: 1240000, farmersCount: 180000 },
  { id: "kien-giang", name: "Kien Giang", nameVi: "Kiên Giang", code: "91", bbox: [103.88, 9.30, 105.42, 10.63] as [number, number, number, number], population: 1900000, farmersCount: 360000 },
  { id: "ca-mau", name: "Ca Mau", nameVi: "Cà Mau", code: "96", bbox: [104.47, 8.53, 105.38, 9.50] as [number, number, number, number], population: 1190000, farmersCount: 220000 },
  { id: "bac-lieu", name: "Bac Lieu", nameVi: "Bạc Liêu", code: "95", bbox: [105.09, 9.10, 105.73, 9.62] as [number, number, number, number], population: 900000, farmersCount: 170000 },
];

// Flood detection thresholds (SAR VV backscatter in dB)
export const FLOOD_THRESHOLDS = {
  VV_DB_THRESHOLD: -15.0,       // Pixels below this = water/flood
  FRACTION_LOW: 0.02,            // 2% flooded area = low
  FRACTION_MEDIUM: 0.08,         // 8% = medium
  FRACTION_HIGH: 0.20,           // 20% = high; above = critical
  MIN_CONFIDENCE: 60,            // Below this = unreliable
} as const;

// Payout thresholds (trigger automatic aid)
export const PAYOUT_THRESHOLDS = {
  FLOOD_INDEX_TRIGGER: 0.08,     // 8% flood fraction triggers payout
  SEVERITY_TRIGGER: ["high", "critical"] as const,
  RICE_VOUCHER_SOL: 0.1,         // SOL on devnet (represents 50kg rice)
  FERTILIZER_VOUCHER_SOL: 0.05,  // SOL on devnet (represents 20kg fertilizer)
} as const;

// Solana config
export const SOLANA_CONFIG = {
  DEVNET_RPC: "https://api.devnet.solana.com",
  BACKUP_RPCS: [
    "https://devnet.helius-rpc.com/?api-key=placeholder",
    "https://rpc-devnet.hellomoon.io/placeholder",
  ],
  PROGRAM_ID: "FLooDS1e1dVNp1an5R3Z5K7AkHBoaRD5VNtFuNiXXXXX",
  COMMITMENT: "confirmed" as const,
} as const;

// Earth Search
export const EARTH_SEARCH_CONFIG = {
  BASE_URL: "https://earth-search.aws.element84.com/v1",
  COLLECTION: "sentinel-1-grd",
  BBOX: MEKONG_BBOX,
  SEARCH_DAYS: 90,
  MAX_RESULTS: 10,
} as const;
