// Ambient declaration for the workerd built-in module, used only by lib/server/bindings.workers.ts.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
