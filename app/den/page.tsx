import type { Metadata } from "next";
import DenExperience from "@/components/den/DenExperience";

export const metadata: Metadata = {
  title: "The Leopard's Den · An interactive world",
  description: "High-five the leopard and explore Mojeeb Titilayo's interactive miniature workshop: real products, creative engineering experiments and an open guestbook.",
  alternates: { canonical: "/den" },
  openGraph: { title: "The Leopard's Den · Mojeeb Titilayo", description: "A tiny world with a big imagination. Meet the leopard and discover the things I've built." },
};

export default function DenPage() {
  return <DenExperience />;
}
