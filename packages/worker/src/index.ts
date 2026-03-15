// Cloudflare Worker main entrypoint — Hono v4 (floodshield-main + ElevenLabs)
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { secureHeaders } from "hono/secure-headers";
import { floodRoutes } from "./routes/flood";
import { alertRoutes } from "./routes/alerts";
import { payoutRoutes } from "./routes/payouts";
import { verifyRoutes } from "./routes/verify";
import { voiceRoutes } from "./routes/voice";
import { scheduledHandler } from "./services/scheduler";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ────────────────────────────────────────────────────────

app.use("*", timing());
app.use("*", logger());
app.use(
  "*",
  secureHeaders({
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
    referrerPolicy: "strict-origin-when-cross-origin",
  }),
);
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      const allowed = [
        "http://localhost:5173",
        "https://floodshield-main.pages.dev",
        "https://floodshield.vn",
      ];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// ── Routes ───────────────────────────────────────────────────────────────────

app.route("/api/flood", floodRoutes);
app.route("/api/alerts", alertRoutes);
app.route("/api/payouts", payoutRoutes);
app.route("/api/verify", verifyRoutes);
app.route("/api/voice", voiceRoutes);

// Health check
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  }),
);

// 404
app.notFound((c) =>
  c.json(
    {
      data: null,
      error: { code: "NOT_FOUND", message: "Endpoint not found" },
      timestamp: new Date().toISOString(),
    },
    404,
  ),
);

// Error handler
app.onError((err, c) => {
  console.error(`[Worker Error]`, err);
  return c.json(
    {
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: c.env.ENVIRONMENT === "development" ? err.message : "Internal server error",
      },
      timestamp: new Date().toISOString(),
    },
    500,
  );
});

// ── Export ───────────────────────────────────────────────────────────────────

export default {
  fetch: app.fetch,
  scheduled: scheduledHandler,
} satisfies ExportedHandler<Env>;
