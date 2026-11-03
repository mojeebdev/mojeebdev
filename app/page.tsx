import type { Metadata } from "next";
import DenExperience from "@/components/den/DenExperience";
import { getPulse } from "@/lib/data/pulse";

/** The homepage is the workshop: visitors land in a live 3D world of Mojeeb's work, guided by the leopard. The profile lives at /profile. */
export const metadata: Metadata = {
  description: "Mojeeb Titilayo's portfolio: high-five the leopard and explore a live 3D workshop of real products, open-source tools and experiments. Mojeeb's profile hangs as the golden lantern.",
  alternates: { canonical: "/" },
};

export const revalidate = 21600;

export default async function Home() {
  return <DenExperience pulse={await getPulse()} />;
}
