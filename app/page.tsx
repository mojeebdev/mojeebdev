import type { Metadata } from "next";
import DenExperience from "@/components/den/DenExperience";
import { getPulse } from "@/lib/data/pulse";

/** The website is the Den: visitors land in the leopard's 3D workshop. The profile lives at /profile. */
export const metadata: Metadata = {
  description: "Step into Mojeeb Titilayo's Den: high-five the leopard and explore a live 3D workshop of real products, open-source tools and experiments. Mojeeb's profile hangs as the golden lantern.",
  alternates: { canonical: "/" },
};

export const revalidate = 21600;

export default async function Home() {
  return <DenExperience pulse={await getPulse()} />;
}
