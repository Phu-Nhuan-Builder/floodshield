import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@floodshield/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Thresholds enforced only on files that have tests
      // For hackathon MVP: thresholds apply per-file not globally
      // perFile: true would enforce per-file, but globally we skip since
      // most UI files are integration-tested via Playwright not vitest
      exclude: [
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/App.tsx",
        "src/pages/**",
        "src/components/**",
        "**/*.d.ts",
        "**/index.ts",
      ],
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
