import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";

/**
 * Cloudflare Workers build (vinext). `next dev` / `next build` keep working alongside it.
 * - `@/lib/server/bindings` resolves to the Workers implementation here, which reads D1 and secrets from
 *   `cloudflare:workers`; Next.js builds use the Node stub, which reports the guestbook as pending activation.
 * - next/image is resized and converted (AVIF/WebP) by the Cloudflare Images binding `IMAGES`.
 * - ISR and fetch caches (revalidate on /, /profile, /activity, /work/[slug]) are shared across isolates through the
 *   KV namespace bound as `VINEXT_KV_CACHE` in wrangler.jsonc. vinext refuses to deploy ISR without a cache adapter.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@/lib/server/bindings": fileURLToPath(new URL("./lib/server/bindings.workers.ts", import.meta.url)),
    },
  },
  plugins: [
    vinext({
      images: { optimizer: imagesOptimizer({ binding: "IMAGES" }) },
      cache: { data: kvDataAdapter({ binding: "VINEXT_KV_CACHE" }) },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
