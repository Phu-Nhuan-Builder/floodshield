import type { FloodZone, FloodAlert, AidPayout, FloodStats, CommunityVerification } from "@floodshield/shared";
export declare function getFloodZones(): Promise<FloodZone[]>;
export declare function getFloodZoneById(id: string): Promise<FloodZone>;
export declare function getFloodStats(): Promise<FloodStats>;
export declare function triggerFloodScan(): Promise<{
    jobId: string;
}>;
export declare function getAlerts(active?: boolean): Promise<FloodAlert[]>;
export declare function acknowledgeAlert(alertId: string): Promise<void>;
export declare function getPayouts(zoneId?: string): Promise<AidPayout[]>;
export declare function triggerPayout(payload: {
    zoneId: string;
    recipientAddress: string;
    aidType: AidPayout["aidType"];
}): Promise<AidPayout>;
export declare function submitVerification(payload: {
    zoneId: string;
    imageUrl: string;
    gpsLat: number;
    gpsLon: number;
    observedSeverity: string;
    notes: string;
}): Promise<CommunityVerification>;
export declare function getVerifications(zoneId: string): Promise<CommunityVerification[]>;
//# sourceMappingURL=api.d.ts.map