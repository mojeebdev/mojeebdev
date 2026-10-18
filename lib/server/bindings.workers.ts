import "server-only";
import { env } from "cloudflare:workers";
import type { WorkerBindings } from "./types";

/** Cloudflare build only (aliased in vite.config.ts). Bindings and secrets come from the Worker `env`. */
export function getBindings(): WorkerBindings {
  return env as unknown as WorkerBindings;
}
