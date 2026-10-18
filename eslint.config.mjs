import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "profile/**", "dist/**", ".wrangler/**", ".vinext/**", "worker-configuration.d.ts"] },
  ...nextVitals,
  ...nextTs,
];

export default config;
