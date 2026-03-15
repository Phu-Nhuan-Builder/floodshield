// ElevenLabs TTS Frontend Service
// Fetches audio from Worker API and plays via Web Audio API
// With IndexedDB client-side cache for offline playback
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
// IndexedDB cache (browser-side audio cache)
const DB_NAME = "floodshield-audio";
const STORE_NAME = "voice-cache";
const DB_VERSION = 1;
async function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
                store.createIndex("expiresAt", "expiresAt");
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
async function getCachedAudio(key) {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const req = tx.objectStore(STORE_NAME).get(key);
            req.onsuccess = () => {
                const record = req.result;
                if (record && record.expiresAt > Date.now()) {
                    resolve(record.audioBase64);
                }
                else {
                    resolve(null);
                }
            };
            req.onerror = () => resolve(null);
        });
    }
    catch {
        return null;
    }
}
async function cacheAudio(key, audioBase64, ttlHours = 72) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({
            key,
            audioBase64,
            expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
        });
    }
    catch (e) {
        console.warn("[VoiceCache] IndexedDB write failed:", e);
    }
}
// Fetch audio from Worker API
export async function fetchVoiceAlert(zoneId) {
    const cacheKey = `zone:${zoneId}`;
    // Check IndexedDB first
    const cached = await getCachedAudio(cacheKey);
    if (cached)
        return cached;
    try {
        const res = await fetch(`${BASE_URL}/voice/alert/${zoneId}`);
        if (!res.ok)
            return null;
        const data = await res.json();
        if (!data.data?.audioBase64)
            return null;
        // Cache in IndexedDB
        await cacheAudio(cacheKey, data.data.audioBase64);
        return data.data.audioBase64;
    }
    catch (e) {
        console.error("[Voice] Fetch failed:", e);
        return null;
    }
}
// Play base64-encoded audio via Web Audio API
export async function playAudioBase64(base64) {
    try {
        const audioCtx = new AudioContext();
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
        return new Promise((resolve) => {
            source.onended = () => {
                audioCtx.close();
                resolve();
            };
        });
    }
    catch (e) {
        console.error("[Voice] Playback failed:", e);
    }
}
// Browser TTS fallback (Web Speech API) for when ElevenLabs unavailable
export function speakVietnamese(text) {
    if (!("speechSynthesis" in window) || !window.speechSynthesis)
        return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    // Use Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith("vi"));
    if (viVoice)
        utterance.voice = viVoice;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    window.speechSynthesis.speak(utterance);
}
// Generate alert text for browser TTS fallback
export function buildAlertText(province, district, severity) {
    const location = district ? `${district}, ${province}` : province;
    const templates = {
        low: `Thông báo: Mực nước tại ${location} đang dâng cao. Người dân cần chú ý.`,
        medium: `Cảnh báo lũ tại ${location}. Di chuyển tài sản lên vùng cao ngay.`,
        high: `Cảnh báo khẩn! Lũ nguy hiểm tại ${location}. Sẵn sàng di tản!`,
        critical: `Khẩn cấp! Lũ nghiêm trọng tại ${location}. Di tản ngay! Liên hệ 1 1 3.`,
    };
    return templates[severity];
}
//# sourceMappingURL=voiceAlert.js.map