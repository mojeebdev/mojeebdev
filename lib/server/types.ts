/**
 * The subset of Cloudflare runtime types this app uses. Kept local so the Next.js (Node) type-check doesn't
 * need the full Workers runtime typings; `npm run cf-typegen` generates the authoritative Env interface
 * from wrangler.jsonc into worker-configuration.d.ts for reference.
 */
export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes?: number; last_row_id?: number; duration?: number; [key: string]: unknown };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
/** Workers Rate Limiting binding (configured in wrangler.jsonc `ratelimits`). */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface WorkerBindings {
  /** D1 database `mojeeb-guestbook`. Absent until the database is created and bound. */
  DB?: D1Database;
  GUESTBOOK_LIMITER?: RateLimit;
  /** Secret: salts IP hashes and signs form tokens. */
  GUESTBOOK_IP_SALT?: string;
  /** Secret (optional): token sign-in for moderation when Cloudflare Access is not configured. */
  GUESTBOOK_ADMIN_TOKEN?: string;
  /** Var: "true" publishes clean entries immediately. Default is review first. */
  GUESTBOOK_AUTO_APPROVE?: string;
  /** Vars: Cloudflare Access protecting /guestbook/admin and /api/guestbook/admin. */
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  NODE_ENV?: string;
}
