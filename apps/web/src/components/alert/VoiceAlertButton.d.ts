import type { FloodSeverity } from "@floodshield/shared";
interface VoiceAlertButtonProps {
    zoneId: string;
    province: string;
    district: string;
    severity: FloodSeverity;
    compact?: boolean;
}
export declare function VoiceAlertButton({ zoneId, province, district, severity, compact, }: VoiceAlertButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=VoiceAlertButton.d.ts.map