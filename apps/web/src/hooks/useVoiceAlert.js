// useVoiceAlert hook — ElevenLabs TTS + Web Speech fallback
import { useState, useCallback, useRef } from "react";
import { fetchVoiceAlert, playAudioBase64, speakVietnamese, buildAlertText } from "../services/voiceAlert";
export function useVoiceAlert() {
    const [state, setState] = useState({
        isPlaying: false,
        isLoading: false,
        error: null,
        source: null,
    });
    const abortRef = useRef(false);
    const playZoneAlert = useCallback(async (zoneId) => {
        abortRef.current = false;
        setState({ isPlaying: false, isLoading: true, error: null, source: null });
        try {
            // Try ElevenLabs first
            const audioBase64 = await fetchVoiceAlert(zoneId);
            if (abortRef.current)
                return;
            if (audioBase64) {
                setState((s) => ({ ...s, isLoading: false, isPlaying: true, source: "elevenlabs" }));
                await playAudioBase64(audioBase64);
                setState((s) => ({ ...s, isPlaying: false }));
            }
            else {
                // Fallback: browser TTS (no network needed)
                setState((s) => ({ ...s, isLoading: false, isPlaying: true, source: "browser-tts" }));
                // Note: we can't get zone details here without props — use generic message
                speakVietnamese("Cảnh báo lũ. Vui lòng kiểm tra thông tin chi tiết trên bản đồ.");
                setState((s) => ({ ...s, isPlaying: false }));
            }
        }
        catch (e) {
            setState({
                isLoading: false,
                isPlaying: false,
                error: "Không thể phát âm thanh cảnh báo",
                source: null,
            });
        }
    }, []);
    const playCustomAlert = useCallback(async (province, district, severity) => {
        abortRef.current = false;
        setState({ isPlaying: false, isLoading: true, error: null, source: null });
        try {
            const text = buildAlertText(province, district, severity);
            setState((s) => ({ ...s, isLoading: false, isPlaying: true, source: "browser-tts" }));
            speakVietnamese(text);
            setState((s) => ({ ...s, isPlaying: false }));
        }
        catch {
            setState({ isLoading: false, isPlaying: false, error: "Lỗi phát âm thanh", source: null });
        }
    }, []);
    const stop = useCallback(() => {
        abortRef.current = true;
        window.speechSynthesis?.cancel();
        setState({ isPlaying: false, isLoading: false, error: null, source: null });
    }, []);
    return {
        ...state,
        playZoneAlert,
        playCustomAlert,
        stop,
    };
}
//# sourceMappingURL=useVoiceAlert.js.map