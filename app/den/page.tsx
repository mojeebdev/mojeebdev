import type { Metadata } from "next";
import DenExperience from "@/components/den/DenExperience";
import { getPulse } from "@/lib/data/pulse";

export const metadata: Metadata = {
  title: "The Leopard's Den · An interactive world",
  description: "High-five the leopard and explore Mojeeb Titilayo's interactive miniature workshop, built from live data: real products, creative engineering experiments and guestbook lanterns.",
  alternates: { canonical: "/den" },
  openGraph: { title: "The Leopard's Den · Mojeeb Titilayo", description: "A tiny world with a big imagination. Meet the leopard and discover the things I've built." },
};

export const revalidate = 21600;

export default async function DenPage() {
  return <DenExperience pulse={await getPulse()} />;
}
