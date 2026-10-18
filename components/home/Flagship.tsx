import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";

/** Arcapush leads the product hierarchy: the product people use, ahead of the tools developers build with. */
export default function Flagship({ index }: { index: string }) {
  return (
    <Section id="arcapush" index={index} label="Flagship product" title="Arcapush" dek="Created by me in February 2026 and run as a BlindspotLab product: a discovery and distribution registry where builders get products, AI agents and hackathon builds found, with a public record and analytics for every listing.">
      <div className="flagship">
        <Image src="/logos/arcapush-mark.svg" alt="" width={56} height={56} className="flagship__logo" />
        <ul role="list" className="flagship__points">
          <li><strong>Discover → visit → track → distribute.</strong> Every outbound visit passes a first-party redirect, so founders see the attention their listing actually delivered.</li>
          <li><strong>Terminal and agent friendly.</strong> The Arcapush CLI and its MCP workflow let builders submit straight from a repository.</li>
          <li><strong>Defensible numbers.</strong> Public metrics ship with their definitions; the live figures are above.</li>
        </ul>
        <div className="flagship__actions">
          <a href="https://arcapush.com" className="btn btn--primary">Visit Arcapush <span aria-hidden="true">↗</span></a>
          <Link href="/work/arcapush" className="btn">Read the case study</Link>
        </div>
      </div>
    </Section>
  );
}
