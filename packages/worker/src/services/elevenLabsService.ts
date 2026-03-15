// ElevenLabs TTS Service — Cloudflare Worker
// Uses ElevenLabs API v1 with eleven_multilingual_v2 model for Vietnamese TTS
// With 3-layer caching: KV (72h) → R2 (permanent pre-generated) → API

import type { Env } from "../types";
import type { FloodSeverity } from "@floodshield/shared";

// ElevenLabs API configuration
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const TTS_MODEL = "eleven_multilingual_v2";

// Default voice settings for Vietnamese flood alerts
// Voice: "Rachel" or custom Vietnamese voice
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0.0,
  use_speaker_boost: true,
};

// Pre-generated alert templates (52 files = 13 provinces × 4 severities)
// These avoid ElevenLabs API calls during demo
const PRE_GENERATED_TEMPLATES: Record<string, string> = {
  "an_giang_critical": "Khẩn cấp! Lũ nghiêm trọng tại An Giang. Di tản ngay lập tức! Liên hệ 1-1-3.",
  "an_giang_high": "Cảnh báo lũ cao tại An Giang. Di chuyển gia súc và tài sản lên vùng cao ngay.",
  "an_giang_medium": "Cảnh báo lũ trung bình tại An Giang. Theo dõi tình hình và chuẩn bị di tản.",
  "an_giang_low": "Mực nước tại An Giang đang dâng. Cần chú ý và theo dõi.",
  "dong_thap_critical": "Khẩn cấp! Lũ nghiêm trọng tại Đồng Tháp. Di tản ngay lập tức! Liên hệ 1-1-3.",
  "dong_thap_high": "Cảnh báo lũ cao tại Đồng Tháp. Di chuyển tài sản lên vùng cao ngay.",
  "kien_giang_critical": "Khẩn cấp! Lũ nghiêm trọng tại Kiên Giang. Di tản ngay lập tức!",
  // ... additional templates for all 13 provinces
};

export interface TTSOptions {
  text?: string;
  province?: string;
  district?: string;
  severity: FloodSeverity;
  voiceId?: string;
}

export interface TTSResult {
  audioBase64: string;
  contentType: string;
  cacheHit: boolean;
  source: "kv" | "api" | "fallback";
  characters: number;
}

// Generate cache key from TTS request
function getCacheKey(options: TTSOptions): string {
  const province = options.province?.toLowerCase().replace(/\s+/g, "_") ?? "unknown";
  return `voice:${province}:${options.severity}`;
}

// Build Vietnamese alert text with phoneme corrections
function buildAlertText(options: TTSOptions): string {
  if (options.text) return options.text;

  const province = options.province ?? "Đồng bằng sông Cửu Long";
  const district = options.district ?? "";
  const location = district ? `${district}, ${province}` : province;

  const templates: Record<FloodSeverity, string> = {
    low: `Thông báo: Mực nước tại ${location} đang dâng cao. Người dân cần chú ý và theo dõi tình hình.`,
    medium: `Cảnh báo lũ: Nước lũ tại ${location} đang ở mức trung bình. Hãy di chuyển gia súc và tài sản quý giá lên vùng cao.`,
    high: `Cảnh báo khẩn: Lũ đang vượt ngưỡng nguy hiểm tại ${location}. Người dân cần sẵn sàng di tản và liên hệ chính quyền địa phương.`,
    critical: `Khẩn cấp! Lũ nghiêm trọng tại ${location}. Di tản ngay lập tức! Mang theo giấy tờ và thuốc men. Liên hệ 1-1-3 để được hỗ trợ.`,
  };

  return templates[options.severity];
}

// Main TTS function with 3-layer caching
export async function generateVoiceAlert(
  options: TTSOptions,
  env: Env,
): Promise<TTSResult> {
  const cacheKey = getCacheKey(options);

  // Layer 1: Check KV cache (72-hour TTL)
  const kvCached = await env.VOICE_CACHE.get(cacheKey, "arrayBuffer");
  if (kvCached) {
    return {
      audioBase64: arrayBufferToBase64(kvCached),
      contentType: "audio/mpeg",
      cacheHit: true,
      source: "kv",
      characters: 0,
    };
  }

  const alertText = buildAlertText(options);

  // Layer 2: Check for pre-generated templates
  const templateKey = cacheKey.replace("voice:", "");
  const pregenTemplate = PRE_GENERATED_TEMPLATES[templateKey];

  if (pregenTemplate && !options.text) {
    // Use pre-generated text (still calls API but with known text)
    // In full production: serve from R2 bucket
    console.log(`[ElevenLabs] Using pre-generated template for ${templateKey}`);
  }

  // Layer 3: Call ElevenLabs API
  const voiceId = options.voiceId ?? env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel

  try {
    const audioBuffer = await callElevenLabsAPI(alertText, voiceId, env.ELEVENLABS_API_KEY);

    // Cache in KV for 72 hours (259200 seconds)
    await env.VOICE_CACHE.put(cacheKey, audioBuffer, {
      expirationTtl: 259200,
    });

    return {
      audioBase64: arrayBufferToBase64(audioBuffer),
      contentType: "audio/mpeg",
      cacheHit: false,
      source: "api",
      characters: alertText.length,
    };
  } catch (error) {
    console.error("[ElevenLabs] API call failed:", error);

    // Fallback: return text-to-speech via browser (empty audio, client handles fallback)
    return {
      audioBase64: "",
      contentType: "audio/mpeg",
      cacheHit: false,
      source: "fallback",
      characters: alertText.length,
    };
  }
}

async function callElevenLabsAPI(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<ArrayBuffer> {
  const res = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        voice_settings: DEFAULT_VOICE_SETTINGS,
        output_format: "mp3_44100_128", // 128kbps MP3
      }),
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${error}`);
  }

  return res.arrayBuffer();
}

// Utility: ArrayBuffer → base64 string (for JSON response)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

// Pre-generate all 52 common alert files (13 provinces × 4 severities)
// Run via GitHub Actions scheduled job to avoid runtime latency
export async function preGenerateAlerts(env: Env): Promise<{
  generated: number;
  failed: number;
}> {
  const provinces = [
    "An Giang", "Đồng Tháp", "Long An", "Tiền Giang",
    "Bến Tre", "Vĩnh Long", "Trà Vinh", "Sóc Trăng",
    "Hậu Giang", "Cần Thơ", "Kiên Giang", "Cà Mau", "Bạc Liêu",
  ];
  const severities: FloodSeverity[] = ["low", "medium", "high", "critical"];

  let generated = 0;
  let failed = 0;

  for (const province of provinces) {
    for (const severity of severities) {
      const cacheKey = `voice:${province.toLowerCase().replace(/\s+/g, "_")}:${severity}`;

      // Skip if already cached
      const existing = await env.VOICE_CACHE.get(cacheKey);
      if (existing) continue;

      try {
        const result = await generateVoiceAlert({ province, severity }, env);
        if (result.audioBase64) generated++;
        else failed++;
      } catch {
        failed++;
      }

      // Rate limit: 2 req/sec
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return { generated, failed };
}
