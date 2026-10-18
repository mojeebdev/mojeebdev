import Image from "next/image";
import { portrait } from "@/content/site";

/** Circular avatar crop (homepage hero). Focal point and zoom come from content/site.ts. */
export function PortraitCircle({ size, priority = false, className = "" }: { size: number; priority?: boolean; className?: string }) {
  const { circle } = portrait;
  return (
    <span className={`portrait-circle ${className}`} style={{ width: size, height: size }}>
      <Image
        src={portrait.src}
        alt={portrait.alt}
        fill
        priority={priority}
        sizes={`${size}px`}
        style={{ objectFit: "cover", objectPosition: circle.focal, transform: `scale(${circle.zoom})`, transformOrigin: circle.focal }}
      />
    </span>
  );
}

/** Full composition (crossed arms on the official portrait) for /about. */
export function PortraitFull({ className = "", sizes = "(min-width: 1024px) 380px, 90vw" }: { className?: string; sizes?: string }) {
  return (
    <span className={`portrait-full ${className}`} style={{ aspectRatio: `${portrait.width} / ${portrait.height}` }}>
      <Image src={portrait.src} alt={portrait.alt} fill sizes={sizes} style={{ objectFit: "cover", objectPosition: portrait.full.focal }} />
    </span>
  );
}
