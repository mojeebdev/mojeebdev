/**
 * Structured logs for Workers Logs (wrangler.jsonc `observability`). One JSON object per line so events can be
 * filtered by `event` in the dashboard. Never pass visitor content, names, IPs or hashes here.
 */
type Level = "info" | "warn" | "error";

export function logEvent(level: Level, event: string, fields: Record<string, string | number | boolean | null | undefined> = {}) {
  const line = JSON.stringify({ level, event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Error name and message only: stacks can carry request data. */
export const errorFields = (err: unknown) => ({
  error: err instanceof Error ? err.name : typeof err,
  message: err instanceof Error ? err.message.slice(0, 200) : undefined,
});
