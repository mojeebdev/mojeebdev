import { ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Mojeeb Titilayo: I think in products. I build the systems behind them.";

export default function Image() {
  return renderOg({
    eyebrow: "Portfolio",
    title: "I think in products. I build the systems behind them.",
    body: "Creator of StackBrief, StyleGraft and the Arcapush CLI.",
    chips: ["Product engineering", "Developer tools", "AI-native products"],
  });
}
