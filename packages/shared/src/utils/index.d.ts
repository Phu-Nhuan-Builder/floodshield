import type { FloodSeverity } from "../types/index.js";
export declare function getSeverityFromFraction(fraction: number): FloodSeverity;
export declare function severityToColor(severity: FloodSeverity): string;
export declare function severityToLabel(severity: FloodSeverity): string;
export declare function formatDateRange(days: number): string;
export declare function formatVietnamDate(iso: string): string;
export declare function timeAgo(iso: string): string;
export declare function generateAlertMessage(district: string, province: string, severity: FloodSeverity): string;
export declare function cn(...classes: Array<string | undefined | false | null>): string;
export declare function formatKm2(km2: number): string;
export declare function formatSolAmount(lamports: number): string;
export declare function truncateAddress(address: string, chars?: number): string;
//# sourceMappingURL=index.d.ts.map