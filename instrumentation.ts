import type { Instrumentation } from "next";
import { logEvent } from "@/lib/server/log";

export function register() {}

/**
 * Server errors → Workers Logs (and Vercel logs while that deployment lives). Only the route and error identity are
 * recorded: no headers, query strings, cookies or bodies, so guestbook content and visitor data never reach the logs.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  logEvent("error", "server.request_error", {
    method: request.method,
    route: context.routePath,
    routeType: context.routeType,
    digest: typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined,
    error: err instanceof Error ? err.name : typeof err,
    message: err instanceof Error ? err.message.slice(0, 200) : undefined,
  });
};
