import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { portrait } from "@/content/site";
import "./token.css";

export const metadata: Metadata = {
  title: "$MOJEEB | Mojeeb Creator Token",
  description: "$MOJEEB is Mojeeb’s personal creator token on Robinhood Chain. Read the story, contract address, intended use of creator fees, and risk disclosures.",
  alternates: { canonical: "/token" },
  openGraph: { title: "$MOJEEB. Still building. Still here.", description: "A transparent look at why I'm launching a personal creator token, what the fees may support, and the risks.", url: "https://mojeeb.xyz/token", type: "website" },
  twitter: { card: "summary_large_image", title: "Still building. A note from Mojeeb.", description: "Why I'm exploring a personal creator token on Robinhood Chain." },
};

export default function TokenPage() {
  return <article className="token-page">
    <header className="token-hero">
      <div className="token-hero-copy">
        <p className="label">An open letter · October 2026</p>
        <h1 className="token-title">Still building.<br/><em>Still here.</em></h1>
        <p className="token-lead">I’m Mojeeb. I build products, the systems behind them, and the tools that help other builders get discovered. This is why I launched $MOJEEB, my personal creator token.</p>
        <div className="token-actions"><a href="#why" className="btn btn--primary">Read my story ↓</a><a href="https://x.com/MojeebMotion" className="btn" target="_blank" rel="noopener noreferrer">Follow updates ↗</a></div>
      </div>
      <div className="token-portrait"><Image src={portrait.src} alt={portrait.alt} width={portrait.width} height={portrait.height} priority sizes="(max-width: 760px) 90vw, 360px" /></div>
    </header>

    <div className="token-status" role="status"><span className="token-dot" aria-hidden="true" /><div><strong>Contract address published</strong><p>Verify the address and network independently before interacting. Do not trust lookalike tokens.</p></div></div>

    <section className="token-section" id="why"><p className="label">01 / The reason</p><h2>Building is one thing.<br/>Keeping it alive is another.</h2><p>For a long time, I’ve funded the products I build myself. Hosting, databases, APIs, maintenance, and the work of shipping improvements. I’m grateful for how far that has taken me.</p><p>I’ve also been pitching my work to potential clients through cold outreach. I haven’t had the responses I hoped for yet. I won’t pretend that silence isn’t discouraging. I’m human. But I don’t want it to stop me from building.</p><p>Some infrastructure limits are becoming difficult to sustain, particularly for Arcapush. I want to make the platform more reliable and capable of onboarding more products without worrying about services failing overnight.</p></section>

    <section className="token-section"><p className="label">02 / The work</p><h2>Real products. Already shipped.</h2><p>Through <a href="https://blindspotlab.xyz" target="_blank" rel="noopener noreferrer">BlindspotLab ↗</a>, I build and maintain products including <a href="https://arcapush.com" target="_blank" rel="noopener noreferrer">Arcapush ↗</a>, <Link href="/work/revel">Revel ↗</Link>, and <a href="https://blindspotlab.xyz/work/dearly" target="_blank" rel="noopener noreferrer">Dearly ↗</a>. The work existed before this token idea, and it will remain the reason I keep showing up.</p><p>You can review the products, code and track record on <Link href="/projects">my projects page ↗</Link>.</p></section>

    <section className="token-section"><p className="label">03 / The experiment</p><h2>A creator token, with clear boundaries.</h2><p>I launched a personal creator token through <a href="https://pons.family" target="_blank" rel="noopener noreferrer">Pons ↗</a> on Robinhood Chain. The token ticker is $MOJEEB. My planned initial purchase was $10; I will confirm the executed amount separately.</p><p>If eligible trading occurs, creator fees may help pay for product infrastructure, continued development, and my personal living expenses. Revenue is not guaranteed, and this is not a claim on BlindspotLab, Arcapush, their assets, or future earnings.</p><p>I may explore community content initiatives and rewards later, but no contests, allocations or payments are promised at this stage. Any future program will have separately published terms and disclosure requirements.</p></section>

    <section className="token-section token-contract"><p className="label">04 / Official contract</p><h2>Contract address.</h2><p>This is the address I have publicly supplied for $MOJEEB. Confirm it independently on the intended chain and through my official channels before interacting.</p><div className="token-address"><span>Contract address</span><strong style={{overflowWrap:"anywhere",fontSize:"clamp(.8rem,1.6vw,1rem)"}}>0x11816bf756ca82cdfdfef87e5d029d45aa6144ba</strong></div><p className="token-small">Launch identity: <strong>mojeeb.eth</strong>. Verify the chain, contract and official announcement before interacting with any token.</p></section>

    <section className="token-section"><p className="label">05 / Read before participating</p><h2>Support should be informed.</h2><p>This is a speculative cryptoasset. Prices can fall sharply or become worthless. Liquidity, trading activity and creator fees are not guaranteed. There are no promised returns, redemption rights, or ownership rights in my products or company. The launch, fees and availability remain subject to platform rules and applicable legal requirements.</p><p>Check the launch platform for the final creator-fee configuration and verify the contract details before trading. Please do your own research and never spend money you need for essentials.</p></section>

    <footer className="token-end"><p className="label">A note from me</p><h2>Still learning.<br/>Still shipping.<br/><em>Not giving up.</em></h2><p>Thank you for following the journey, sharing the work, and giving independent builders a chance.</p><div className="token-actions"><a href="https://x.com/MojeebMotion" className="btn btn--primary" target="_blank" rel="noopener noreferrer">Follow @MojeebMotion ↗</a><Link href="/contact" className="btn">Work with me ↗</Link></div><p className="token-small">DYOR · NFA · Last updated October 2026</p></footer>
  </article>;
}
