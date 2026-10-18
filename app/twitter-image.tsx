import { ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Mojeeb Titilayo, Product Engineer + Strategist. Founder of BlindspotLab. Creator of Arcapush.";

export default function Image() {
  return renderOg({
    eyebrow: "Product Engineer + Strategist",
    title: "Founder of BlindspotLab. Creator of Arcapush.",
    body: "Also behind StackBrief, StyleGraft, and the Arcapush CLI.",
    chips: ["Products people use", "Tools developers build with"],
  });
}
