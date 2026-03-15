import type { FloodZone, FloodAlert, AidPayout } from "@floodshield/shared";
export declare const QUERY_KEYS: {
    floodZones: readonly ["flood-zones"];
    floodStats: readonly ["flood-stats"];
    alerts: (active?: boolean) => readonly ["alerts", boolean | undefined];
    payouts: (zoneId?: string) => readonly ["payouts", string | undefined];
    verifications: (zoneId: string) => readonly ["verifications", string];
};
export declare function useFloodZones(): import("@tanstack/react-query").UseQueryResult<FloodZone[], Error>;
export declare function useFloodStats(): import("@tanstack/react-query").UseQueryResult<import("@floodshield/shared").FloodStats, Error>;
export declare function useRealtimeFloodZones(): void;
export declare function useAlerts(active?: boolean): import("@tanstack/react-query").UseQueryResult<FloodAlert[], Error>;
export declare function useAcknowledgeAlert(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
export declare function usePayouts(zoneId?: string): import("@tanstack/react-query").UseQueryResult<AidPayout[], Error>;
export declare function useTriggerPayout(): import("@tanstack/react-query").UseMutationResult<AidPayout, Error, {
    zoneId: string;
    recipientAddress: string;
    aidType: AidPayout["aidType"];
}, unknown>;
export declare function useVerifications(zoneId: string): import("@tanstack/react-query").UseQueryResult<import("@floodshield/shared").CommunityVerification[], Error>;
export declare function useSubmitVerification(): import("@tanstack/react-query").UseMutationResult<import("@floodshield/shared").CommunityVerification, Error, {
    zoneId: string;
    imageUrl: string;
    gpsLat: number;
    gpsLon: number;
    observedSeverity: string;
    notes: string;
}, unknown>;
//# sourceMappingURL=useFloodData.d.ts.map