import type { NextConfig } from "next";

const caseStudies = ["arcapush", "stackbrief", "revel", "admon"];
const archived = ["blindspotlab", "sitehook", "capself", "whate"];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 60 * 60 * 24 * 30 },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      ...caseStudies.map((slug) => ({ source: `/projects/${slug}`, destination: `/work/${slug}`, permanent: true })),
      ...archived.map((slug) => ({ source: `/projects/${slug}`, destination: `/projects#${slug}`, permanent: true })),
      { source: "/experience", destination: "/about#experience", permanent: true },
      { source: "/approach", destination: "/about#daeto", permanent: true },
      { source: "/ai", destination: "/work", permanent: true },
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/builds", destination: "/projects", permanent: true },
      { source: "/mojeeb_headshot.png", destination: "/portrait/mojeeb-portrait.png", permanent: false },
    ];
  },
};

export default nextConfig;
