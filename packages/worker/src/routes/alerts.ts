// Alert routes
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";
import { ok, err } from "../utils/response";

export const alertRoutes = new Hono<{ Bindings: Env }>();

// GET /api/alerts?active=true
alertRoutes.get("/", async (c) => {
  const active = c.req.query("active");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from("flood_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (active === "true") {
    query = query.is("acknowledged_at", null);
  }

  const { data, error } = await query;
  if (error) return c.json(err("DB_ERROR", error.message), 500);

  return c.json(ok(data));
});

// POST /api/alerts/:id/acknowledge
alertRoutes.post("/:id/acknowledge", async (c) => {
  const id = c.req.param("id");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from("flood_alerts")
    .update({ acknowledged_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return c.json(err("DB_ERROR", error.message), 500);

  return c.json(ok({ acknowledged: true }));
});
