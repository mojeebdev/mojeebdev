import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { portrait } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

async function assets() {
  const root = process.cwd();
  const [regular, semibold, photo] = await Promise.all([
    readFile(path.join(root, "app/fonts/og/hanken-grotesk-latin-400-normal.woff")),
    readFile(path.join(root, "app/fonts/og/hanken-grotesk-latin-600-normal.woff")),
    readFile(path.join(root, "public", portrait.src)),
  ]);
  const mime = portrait.src.endsWith(".jpg") ? "image/jpeg" : "image/png";
  return { regular, semibold, photo: `data:${mime};base64,${photo.toString("base64")}` };
}

/** Shared Open Graph card: identity on the left, page subject on the right. */
export async function renderOg({ eyebrow, title, body, chips = [] }: { eyebrow: string; title: string; body?: string; chips?: string[] }) {
  const a = await assets();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#FAFAF8", color: "#16171A", fontFamily: "Hanken" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori (next/og) renders plain <img> */}
          <img src={a.photo} width={88} height={88} style={{ borderRadius: 999, objectFit: "cover", objectPosition: portrait.circle.focal, border: "1px solid #E4E5E8" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>Mojeeb Titilayo</div>
            <div style={{ fontSize: 22, color: "#6B707A" }}>Product Engineer + Strategist · Founder of BlindspotLab · Creator of Arcapush</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1000 }}>
          <div style={{ fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: "#1F66E0" }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 40 ? 56 : 72, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
          {body && <div style={{ fontSize: 28, lineHeight: 1.35, color: "#4A4E56" }}>{body}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E4E5E8", paddingTop: 22 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {chips.map((c) => <div key={c} style={{ fontSize: 20, padding: "6px 14px", border: "1px solid #CDD0D5", borderRadius: 999, color: "#4A4E56" }}>{c}</div>)}
          </div>
          <div style={{ fontSize: 22, color: "#6B707A" }}>mojeeb.xyz</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Hanken", data: a.regular, weight: 400 }, { name: "Hanken", data: a.semibold, weight: 600 }] },
  );
}
