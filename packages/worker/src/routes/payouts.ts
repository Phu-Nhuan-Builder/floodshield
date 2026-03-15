// Payout routes
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";
import { ok, err } from "../utils/response";
import { executePayout } from "../services/solanaService";

export const payoutRoutes = new Hono<{ Bindings: Env }>();

// GET /api/payouts?zoneId=xxx
payoutRoutes.get("/", async (c) => {
  const zoneId = c.req.query("zoneId");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from("aid_payouts")
    .select("*")
    .order("triggered_at", { ascending: false })
    .limit(100);

  if (zoneId) {
    query = query.eq("zone_id", zoneId);
  }

  const { data, error } = await query;
  if (error) return c.json(err("DB_ERROR", error.message), 500);

  return c.json(ok(data));
});

// POST /api/payouts/trigger
payoutRoutes.post("/trigger", async (c) => {
  const body = await c.req.json<{
    zoneId: string;
    recipientAddress: string;
    aidType: "rice_voucher" | "fertilizer_voucher" | "cash";
  }>();

  if (!body.zoneId || !body.recipientAddress || !body.aidType) {
    return c.json(err("VALIDATION", "Missing required fields"), 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Verify zone exists and meets threshold
  const { data: zone, error: zoneErr } = await supabase
    .from("flood_zones")
    .select("*")
    .eq("id", body.zoneId)
    .single();

  if (zoneErr || !zone) {
    return c.json(err("NOT_FOUND", "Zone not found"), 404);
  }

  if (!["high", "critical"].includes(zone.severity)) {
    return c.json(err("THRESHOLD_NOT_MET", "Zone severity too low for payout"), 400);
  }

  // Determine amount (in lamports)
  const amounts = {
    rice_voucher: 100_000_000,        // 0.1 SOL
    fertilizer_voucher: 50_000_000,   // 0.05 SOL
    cash: 200_000_000,                // 0.2 SOL
  };

  const amount = amounts[body.aidType];

  // Insert payout record as pending
  const { data: payout, error: insertErr } = await supabase
    .from("aid_payouts")
    .insert({
      zone_id: body.zoneId,
      province: zone.province,
      recipient_address: body.recipientAddress,
      recipient_name: "Community Member",
      amount,
      aid_type: body.aidType,
      status: "pending",
      triggered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertErr || !payout) {
    return c.json(err("DB_ERROR", insertErr?.message ?? "Insert failed"), 500);
  }

  // Execute Solana transaction asynchronously (use waitUntil in production)
  // For hackathon, execute directly
  try {
    const txSignature = await executePayout({
      recipientAddress: body.recipientAddress,
      amountLamports: amount,
      env: c.env,
    });

    await supabase
      .from("aid_payouts")
      .update({
        tx_signature: txSignature,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    return c.json(ok({ ...payout, tx_signature: txSignature, status: "confirmed" }));
  } catch (e) {
    // Mark as failed
    await supabase
      .from("aid_payouts")
      .update({ status: "failed" })
      .eq("id", payout.id);

    const msg = e instanceof Error ? e.message : "Transaction failed";
    return c.json(err("TX_ERROR", msg), 500);
  }
});
