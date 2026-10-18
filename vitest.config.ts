import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests run in Node with a real SQLite engine standing in for D1 (tests/d1.ts). Separate from vite.config.ts so
// the vinext and Cloudflare plugins aren't loaded.
export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)),
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
