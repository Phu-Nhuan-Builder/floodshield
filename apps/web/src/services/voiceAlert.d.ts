import type { FloodSeverity } from "@floodshield/shared";
export declare function fetchVoiceAlert(zoneId: string): Promise<string | null>;
export declare function playAudioBase64(base64: string): Promise<void>;
export declare function speakVietnamese(text: string): void;
export declare function buildAlertText(province: string, district: string, severity: FloodSeverity): string;
//# sourceMappingURL=voiceAlert.d.ts.map