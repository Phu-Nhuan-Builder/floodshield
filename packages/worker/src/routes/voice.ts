// Voice alert routes — ElevenLabs TTS endpoints
// GET  /api/voice/alert/:zoneId — Get audio for flood zone
// POST /api/voice/generate — Generate custom TTS
// POST /api/voice/pre-generate — Pre-generate all 52 common alerts (admin)

import { Hono } from "hono";
import type { Env } from "../types";
import { createClient } from "@supabase/supabase-js";
import { generateVoiceAlert, preGenerateAlerts } from "../services/elevenLabsService";
import { ok, err } from "../utils/response";
import type { FloodSeverity } from "@floodshield/shared";

export const voiceRoutes = new Hono<{ Bindings: Env }>();

// GET /api/voice/alert/:zoneId — Generate/serve voice alert for a flood zone
voiceRoutes.get("/alert/:zoneId", async (c) => {
  const zoneId = c.req.param("zoneId");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get zone details
  const { data: zone, error } = await supabase
    .from("flood_zones")
    .select("province, district, severity")
    .eq("id", zoneId)
    .single();

  if (error || !zone) {
    return c.json(err("NOT_FOUND", `Zone ${zoneId} not found`), 404);
  }

  // Generate or retrieve from cache
  const result = await generateVoiceAlert(
    {
      province: zone.province,
      district: zone.district,
      severity: zone.severity as FloodSeverity,
    },
    c.env,
  );

  if (!result.audioBase64) {
    return c.json(err("TTS_UNAVAILABLE", "Voice generation unavailable, use text alert"), 503);
  }

  // Return as JSON with base64 audio (client decodes and plays)
  return c.json(
    ok({
      audioBase64: result.audioBase64,
      contentType: result.contentType,
      cacheHit: result.cacheHit,
      source: result.source,
      province: zone.province,
      severity: zone.severity,
    }),
  );
});

// GET /api/voice/alert/:zoneId/stream — Stream audio directly (for <audio> src)
voiceRoutes.get("/alert/:zoneId/stream", async (c) => {
  const zoneId = c.req.param("zoneId");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: zone } = await supabase
    .from("flood_zones")
    .select("province, district, severity")
    .eq("id", zoneId)
    .single();

  if (!zone) return new Response("Zone not found", { status: 404 });

  // Check KV cache first
  const cacheKey = `voice:${zone.province.toLowerCase().replace(/\s+/g, "_")}:${zone.severity}`;
  const kvCached = await c.env.VOICE_CACHE.get(cacheKey, "arrayBuffer");

  if (kvCached) {
    return new Response(kvCached, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
        "X-Cache-Hit": "true",
      },
    });
  }

  // Generate fresh
  const result = await generateVoiceAlert(
    {
      province: zone.province,
      district: zone.district,
      severity: zone.severity as FloodSeverity,
    },
    c.env,
  );

  if (!result.audioBase64) {
    return new Response("TTS unavailable", { status: 503 });
  }

  const audioBuffer = base64ToArrayBuffer(result.audioBase64);

  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
      "X-Cache-Hit": "false",
    },
  });
});

// POST /api/voice/generate — Generate custom TTS text
voiceRoutes.post("/generate", async (c) => {
  const body = await c.req.json<{
    text?: string;
    province?: string;
    district?: string;
    severity: FloodSeverity;
    voiceId?: string;
  }>();

  if (!body.severity) {
    return c.json(err("VALIDATION", "severity is required"), 400);
  }

  const result = await generateVoiceAlert(body, c.env);

  return c.json(ok(result));
});

// POST /api/voice/pre-generate — Pre-generate all 52 common alerts (cron/admin)
voiceRoutes.post("/pre-generate", async (c) => {
  const authHeader = c.req.header("Authorization");
  const expectedKey = c.env.ELEVENLABS_API_KEY; // Reuse as admin key for simplicity

  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return c.json(err("UNAUTHORIZED", "Invalid authorization"), 401);
  }

  const result = await preGenerateAlerts(c.env);

  return c.json(ok(result));
});

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
