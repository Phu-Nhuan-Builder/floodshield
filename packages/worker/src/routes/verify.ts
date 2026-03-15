// Verify routes — community verification
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";
import { ok, err } from "../utils/response";

export const verifyRoutes = new Hono<{ Bindings: Env }>();

// GET /api/verify?zoneId=xxx
verifyRoutes.get("/", async (c) => {
  const zoneId = c.req.query("zoneId");
  if (!zoneId) return c.json(err("VALIDATION", "zoneId required"), 400);

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("community_verifications")
    .select("*")
    .eq("zone_id", zoneId)
    .order("verified_at", { ascending: false });

  if (error) return c.json(err("DB_ERROR", error.message), 500);

  return c.json(ok(data));
});

// POST /api/verify
verifyRoutes.post("/", async (c) => {
  const body = await c.req.json<{
    zoneId: string;
    imageUrl: string;
    gpsLat: number;
    gpsLon: number;
    observedSeverity: string;
    notes: string;
  }>();

  if (!body.zoneId || !body.imageUrl || !body.gpsLat || !body.gpsLon) {
    return c.json(err("VALIDATION", "Missing required fields"), 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("community_verifications")
    .insert({
      zone_id: body.zoneId,
      submitter_address: "anonymous",
      submitter_name: "Community Member",
      image_url: body.imageUrl,
      gps_lat: body.gpsLat,
      gps_lon: body.gpsLon,
      observed_severity: body.observedSeverity,
      notes: body.notes,
      verified_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return c.json(err("DB_ERROR", error.message), 500);

  // Update zone confidence based on community input
  c.executionCtx?.waitUntil(
    updateZoneConfidence(body.zoneId, body.observedSeverity, supabase),
  );

  return c.json(ok(data), 201);
});

async function updateZoneConfidence(
  zoneId: string,
  observedSeverity: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<void> {
  const { data: zone } = await supabase
    .from("flood_zones")
    .select("severity, confidence")
    .eq("id", zoneId)
    .single();

  if (!zone) return;

  // If community observation matches satellite — boost confidence
  const boost = zone.severity === observedSeverity ? 5 : -2;
  const newConfidence = Math.max(0, Math.min(100, (zone.confidence ?? 70) + boost));

  await supabase
    .from("flood_zones")
    .update({ confidence: newConfidence })
    .eq("id", zoneId);
}
