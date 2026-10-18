import Link from "next/link";
import Leopard from "@/components/mascot/Leopard";

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="nf-title">
      <Leopard pose="look" expression="curious" size={180} />
      <p className="label">404</p>
      <h1 id="nf-title" className="h1">The leopard looked everywhere.</h1>
      <p className="dek">This page doesn’t exist, or it moved when the site was rebuilt.</p>
      <div className="hero__ctas">
        <Link href="/" className="btn btn--primary">Back to profile</Link>
        <Link href="/projects" className="btn">Browse all projects</Link>
      </div>
    </section>
  );
}
