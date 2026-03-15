import type { FloodSeverity } from "@floodshield/shared";
export declare function useVoiceAlert(): {
    playZoneAlert: (zoneId: string) => Promise<void>;
    playCustomAlert: (province: string, district: string, severity: FloodSeverity) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
    source: "elevenlabs" | "browser-tts" | null;
};
//# sourceMappingURL=useVoiceAlert.d.ts.map