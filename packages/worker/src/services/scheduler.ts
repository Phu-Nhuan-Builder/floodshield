// Scheduled cron handler — runs every 6 hours
import { searchSentinel1 } from "./earthSearch";
import { computeFloodIndex } from "./floodIndex";
import type { Env } from "../types";

export async function scheduledHandler(
  _controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  console.log(`[Scheduler] Cron triggered at ${new Date().toISOString()}`);

  ctx.waitUntil(runFloodScan(env));
}

async function runFloodScan(env: Env): Promise<void> {
  try {
    const items = await searchSentinel1({
      bbox: [103.5, 8.5, 106.5, 11.5],
      days: 90,
      limit: 5,
    });

    if (items.length === 0) {
      console.log("[Scheduler] No new Sentinel-1 items found");
      return;
    }

    console.log(`[Scheduler] Processing ${items.length} STAC items`);

    const results = await Promise.allSettled(
      items.map((item) => computeFloodIndex(item, env)),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      console.error("[Scheduler] Failed items:", failed.map((f) => f.reason));
    }

    console.log(
      `[Scheduler] Complete: ${succeeded}/${items.length} items processed successfully`,
    );
  } catch (error) {
    console.error("[Scheduler] Fatal error:", error);
  }
}
