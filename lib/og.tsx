import { ImageResponse } from "next/og";
import { portrait } from "@/content/site";
import { ogFontRegular, ogFontSemibold, ogPhoto, ogPortraitSrc } from "./og-assets.generated";

export const ogSize = { width: 1200, height: 630 };

/**
 * Fonts and the avatar are inlined at build time (scripts/og-assets.mjs) because Cloudflare Workers have no
 * filesystem. If the portrait changes without regenerating, fail the build loudly rather than ship a stale face.
 */
if (ogPortraitSrc !== portrait.src) throw new Error(`OG avatar is stale (${ogPortraitSrc} ≠ ${portrait.src}). Run: npm run og:assets`);

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
const fonts = { regular: bytes(ogFontRegular), semibold: bytes(ogFontSemibold) };

function assets() {
  return { ...fonts, photo: ogPhoto };
}

/**
 * Shared Open Graph card: identity at the top, page subject in the middle, and a solid call to action in the footer
 * (`cta` defaults to "Explore my work"; the card always names the destination domain).
 */
export async function renderOg({ eyebrow, title, body, chips = [], cta = "Explore my work" }: { eyebrow: string; title: string; body?: string; chips?: string[]; cta?: string }) {
  const a = assets();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#FAFAF8", color: "#16171A", fontFamily: "Hanken" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori (next/og) renders plain <img> */}
          <img src={a.photo} width={88} height={88} style={{ borderRadius: 999, objectFit: "cover", border: "1px solid #E4E5E8" }} alt="" />
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
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px 14px 26px", borderRadius: 999, background: "#16171A", color: "#FFFFFF", boxShadow: "0 6px 18px rgba(22, 23, 26, 0.18)" }}>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.3 }}>{cta}</div>
            <div style={{ fontSize: 20, color: "#AEB3BC" }}>mojeeb.xyz</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, background: "#1F66E0", fontSize: 22, fontWeight: 600 }}>→</div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Hanken", data: a.regular, weight: 400 }, { name: "Hanken", data: a.semibold, weight: 600 }] },
  );
}
