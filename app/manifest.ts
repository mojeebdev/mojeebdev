import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mojeeb Titilayo",
    short_name: "Mojeeb",
    description: "Product engineer and strategist. Founder of BlindspotLab; creator of StackBrief, StyleGraft and the Arcapush CLI.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#FAFAF8",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
  };
}
