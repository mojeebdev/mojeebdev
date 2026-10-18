import "server-only";
import type { WorkerBindings } from "./types";

/**
 * Cloudflare bindings (D1, rate limiter) and Worker secrets.
 *
 * This default implementation is what `next build` / `next dev` compile (Node, no bindings): it returns only
 * process.env, so the guestbook reports "pending activation" instead of failing. The Cloudflare build swaps in
 * ./bindings.workers.ts through a Vite alias (vite.config.ts), which reads `env` from `cloudflare:workers`.
 */
export function getBindings(): WorkerBindings {
  return { ...(process.env as Record<string, string | undefined>) } as WorkerBindings;
}
