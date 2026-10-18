import { caseStudies, getCaseStudy } from "@/content/caseStudies";
import { ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study by Mojeeb Titilayo";
export function generateStaticParams() { return caseStudies.map((c) => ({ slug: c.slug })); }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCaseStudy(slug)!;
  return renderOg({ eyebrow: `Case study ${c.number}`, title: c.title, body: c.dek, chips: [c.kindLabel.split(" · ")[0], c.statusLabel, c.period] });
}
