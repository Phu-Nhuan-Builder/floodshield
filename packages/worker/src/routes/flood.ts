// Flood routes — GET /api/flood/zones, /api/flood/stats, POST /api/flood/scan
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";
import type { FloodStats } from "@floodshield/shared";
import { computeFloodIndex } from "../services/floodIndex";
import { searchSentinel1 } from "../services/earthSearch";
import { ok, err } from "../utils/response";

export const floodRoutes = new Hono<{ Bindings: Env }>();

// GET /api/flood/zones
floodRoutes.get("/zones", async (c) => {
  // Check KV cache first (5 min TTL)
  const cached = await c.env.FLOOD_CACHE.get("flood:zones", "json");
  if (cached) {
    return c.json(ok(cached));
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("flood_zones")
    .select("*")
    .order("severity", { ascending: false })
    .order("detected_at", { ascending: false });

  if (error) return c.json(err("DB_ERROR", error.message), 500);

  // Cache for 5 minutes
  await c.env.FLOOD_CACHE.put("flood:zones", JSON.stringify(data), {
    expirationTtl: 300,
  });

  return c.json(ok(data));
});

// GET /api/flood/zones/:id
floodRoutes.get("/zones/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("flood_zones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return c.json(err("NOT_FOUND", `Zone ${id} not found`), 404);
  return c.json(ok(data));
});

// GET /api/flood/stats
floodRoutes.get("/stats", async (c) => {
  const cached = await c.env.FLOOD_CACHE.get("flood:stats", "json");
  if (cached) return c.json(ok(cached));

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: zones } = await supabase.from("flood_zones").select("severity, flooded_area_km2");
  const { count: payoutTotal } = await supabase
    .from("aid_payouts")
    .select("*", { count: "exact", head: true });
  const { count: payoutConfirmed } = await supabase
    .from("aid_payouts")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed");

  const stats: FloodStats = {
    totalZones: zones?.length ?? 0,
    criticalZones: zones?.filter((z) => z.severity === "critical").length ?? 0,
    highZones: zones?.filter((z) => z.severity === "high").length ?? 0,
    mediumZones: zones?.filter((z) => z.severity === "medium").length ?? 0,
    lowZones: zones?.filter((z) => z.severity === "low").length ?? 0,
    totalAffectedKm2: zones?.reduce((sum, z) => sum + (z.flooded_area_km2 ?? 0), 0) ?? 0,
    totalPayoutsTriggered: payoutTotal ?? 0,
    totalPayoutsConfirmed: payoutConfirmed ?? 0,
    lastUpdated: new Date().toISOString(),
  };

  await c.env.FLOOD_CACHE.put("flood:stats", JSON.stringify(stats), { expirationTtl: 120 });

  return c.json(ok(stats));
});

// POST /api/flood/scan — Trigger manual scan (admin only)
floodRoutes.post("/scan", async (c) => {
  try {
    const items = await searchSentinel1({
      bbox: [103.5, 8.5, 106.5, 11.5],
      days: 90,
      limit: 5,
    });

    if (items.length === 0) {
      return c.json(ok({ jobId: "none", message: "No new Sentinel-1 items found" }));
    }

    const results = await Promise.allSettled(
      items.map((item) => computeFloodIndex(item, c.env)),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;

    // Invalidate caches
    await Promise.all([
      c.env.FLOOD_CACHE.delete("flood:zones"),
      c.env.FLOOD_CACHE.delete("flood:stats"),
    ]);

    return c.json(
      ok({
        jobId: crypto.randomUUID(),
        itemsProcessed: items.length,
        succeeded,
        failed: items.length - succeeded,
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Scan failed";
    return c.json(err("SCAN_ERROR", msg), 500);
  }
});
