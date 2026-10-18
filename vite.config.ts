import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

/**
 * Cloudflare Workers build (vinext). `next dev` / `next build` keep working alongside it.
 * - `@/lib/server/bindings` resolves to the Workers implementation here, which reads D1 and secrets from
 *   `cloudflare:workers`; Next.js builds use the Node stub, which reports the guestbook as pending activation.
 * - next/image is resized and converted (AVIF/WebP) by the Cloudflare Images binding `IMAGES`.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@/lib/server/bindings": fileURLToPath(new URL("./lib/server/bindings.workers.ts", import.meta.url)),
    },
  },
  plugins: [
    vinext({ images: { optimizer: imagesOptimizer({ binding: "IMAGES" }) } }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
