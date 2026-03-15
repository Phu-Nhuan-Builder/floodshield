export declare const MEKONG_BBOX: [number, number, number, number];
export declare const MEKONG_CENTER: [number, number];
export declare const MEKONG_DEFAULT_ZOOM = 7;
export declare const MEKONG_PROVINCES: {
    id: string;
    name: string;
    nameVi: string;
    code: string;
    bbox: [number, number, number, number];
    population: number;
    farmersCount: number;
}[];
export declare const FLOOD_THRESHOLDS: {
    readonly VV_DB_THRESHOLD: -15;
    readonly FRACTION_LOW: 0.02;
    readonly FRACTION_MEDIUM: 0.08;
    readonly FRACTION_HIGH: 0.2;
    readonly MIN_CONFIDENCE: 60;
};
export declare const PAYOUT_THRESHOLDS: {
    readonly FLOOD_INDEX_TRIGGER: 0.08;
    readonly SEVERITY_TRIGGER: readonly ["high", "critical"];
    readonly RICE_VOUCHER_SOL: 0.1;
    readonly FERTILIZER_VOUCHER_SOL: 0.05;
};
export declare const SOLANA_CONFIG: {
    readonly DEVNET_RPC: "https://api.devnet.solana.com";
    readonly BACKUP_RPCS: readonly ["https://devnet.helius-rpc.com/?api-key=placeholder", "https://rpc-devnet.hellomoon.io/placeholder"];
    readonly PROGRAM_ID: "FLooDS1e1dVNp1an5R3Z5K7AkHBoaRD5VNtFuNiXXXXX";
    readonly COMMITMENT: "confirmed";
};
export declare const EARTH_SEARCH_CONFIG: {
    readonly BASE_URL: "https://earth-search.aws.element84.com/v1";
    readonly COLLECTION: "sentinel-1-grd";
    readonly BBOX: [number, number, number, number];
    readonly SEARCH_DAYS: 90;
    readonly MAX_RESULTS: 10;
};
//# sourceMappingURL=index.d.ts.map