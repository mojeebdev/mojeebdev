import Image from "next/image";
import Link from "next/link";
import { projects, type Project } from "@/lib/projects";
import MobileNavigation from "@/components/MobileNavigation";
import ProjectLogo from "@/components/ProjectLogo";
import { displayProjectStatus, ExternalArrow, prettyCategory } from "@/components/ProjectPrimitives";

const strategyCapabilities = [
  ["Product direction", "Finding the strongest product angle before implementation begins."],
  ["Positioning", "Making the value, audience, and reason to care immediately clear."],
  ["MVP scoping", "Choosing the smallest strong version that can prove the product."],
  ["Product systems", "Designing the structure that lets a product keep improving."],
] as const;

const engineeringCapabilities = [
  ["AI product engineering", "Building useful AI-native SaaS, agents, RAG, and MCP workflows."],
  ["System architecture", "Designing maintainable products, integrations, and technical foundations."],
  ["Developer tools", "Creating tools that improve understanding, execution, and engineering quality."],
  ["Web3 products", "Shipping onchain identity, credentials, smart contracts, and builder platforms."],
] as const;

const milestones = [
  ["40+", "products, tools, experiments, and platforms shipped"],
  ["146", "products indexed on Arcapush as of July 28, 2026"],
  ["500+", "StackBrief downloads as of July 2026"],
  ["10,516", "meals indexed by Whate"],
] as const;

const principles = [
  ["Think before prompting", "AI accelerates execution, but context and judgement determine the quality of the result."],
  ["Improve before rebuilding", "Understand the exact problem and preserve what already works before replacing a system."],
  ["Make useful ideas compound", "Turn temporary information and overlooked opportunities into lasting products."],
] as const;

const projectBySlug = (slug: string) => {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Missing project: ${slug}`);
  return project;
};

function WorkLink({ project, label = "Visit project" }: { project: Project; label?: string }) {
  if (!project.url) return null;
  return <a className="work-link" href={project.url} target="_blank" rel="noopener noreferrer">{label} <ExternalArrow /></a>;
}

function ProfileLink({ project }: { project: Project }) {
  if (!project.selected) return null;
  return <Link className="secondary-link" href={`/projects/${project.slug}`}>Project profile &#8594;</Link>;
}

function ProjectVisual({ project }: { project: Project }) {
  if (project.visual) {
    return (
      <div className="dual-project-visual dual-project-visual--image">
        <Image src={project.visual} alt={project.visualAlt ?? ""} fill sizes="(max-width: 760px) 100vw, 50vw" />
      </div>
    );
  }

  return (
    <div className="dual-project-visual dual-project-visual--type" aria-hidden="true">
      <ProjectLogo project={project} size="lg" />
      <small>{prettyCategory(project.category[0])}</small>
    </div>
  );
}

function SelectedProjectCard({ project, dark = false }: { project: Project; dark?: boolean }) {
  return (
    <article className={`dual-work-card${dark ? " dual-work-card--dark" : ""}`}>
      <ProjectVisual project={project} />
      <div className="dual-work-card__copy">
        <ProjectLogo project={project} size="md" className="dual-work-card__logo" />
        <p className="section-kicker">{prettyCategory(project.category[0])} / {displayProjectStatus(project)}</p>
        <h3>{project.name}</h3>
        {project.description && <p>{project.description}</p>}
        {project.snapshot && <p className="project-fact">{project.snapshot}</p>}
        <div className="route-card__links">
          <ProfileLink project={project} />
          <WorkLink project={project} />
        </div>
      </div>
    </article>
  );
}

export default function EditorialPortfolio() {
  const blindspotLab = projectBySlug("blindspotlab");
  const stackBrief = projectBySlug("stackbrief");
  const projectPreview = ["arcapush", "revel", "sitehook", "capself", "whate", "admon"].map(projectBySlug);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <MobileNavigation />

      <main id="main">
        <section className="dual-identity-hero" aria-labelledby="hero-title">
          <div className="identity-panel identity-panel--strategy" aria-hidden="true" />
          <div className="identity-panel identity-panel--engineering" aria-hidden="true" />

          <div className="identity-kicker identity-kicker--strategy">
            <span>I think like a</span>
            <strong>Product Strategist</strong>
          </div>
          <div className="identity-kicker identity-kicker--engineering">
            <span>I build like an</span>
            <strong>AI Product Engineer</strong>
          </div>

          <h1 id="hero-title" className="identity-heading">
            <span className="identity-line identity-line--strategy">Product<br />Strategist</span>
            <span className="identity-line identity-line--engineering">AI Product<br />Engineer</span>
          </h1>

          <figure className="dual-portrait">
            <Image
              src="/mojeeb_headshot.png"
              alt="Mojeeb Titilayo, AI Product Engineer and Product Strategist"
              fill
              priority
              sizes="(max-width: 760px) 70vw, 28vw"
            />
          </figure>

          <div className="identity-summary identity-summary--strategy">
            <p>Product direction, positioning, opportunity discovery, and disciplined MVP decisions.</p>
            <Link href="/approach">See my approach <span aria-hidden="true">&#8599;</span></Link>
          </div>
          <div className="identity-summary identity-summary--engineering">
            <p>AI-native products, system architecture, developer tools, SaaS, and Web3 execution.</p>
            <Link href="/work">View selected work <span aria-hidden="true">&#8599;</span></Link>
          </div>

          <div className="identity-meta">
            <span>Mojeeb Titilayo · Lagos, Nigeria</span>
            <span>Building since 2014 · Available for selected work</span>
          </div>
        </section>

        <section className="identity-proof panel" aria-labelledby="identity-proof-title">
          <div>
            <p className="section-kicker">Who am I?</p>
            <h2 id="identity-proof-title">Strategy before execution.<br /><em>Systems before noise.</em></h2>
          </div>
          <div className="identity-proof__answer">
            <p>I’m an AI Product Engineer, System Architect, and Product Strategist based in Nigeria. I turn rough ideas, useful information, and overlooked problems into clear, buildable products across AI, SaaS, developer tools, and Web3.</p>
            <p>My work combines product judgement with hands-on engineering: understanding what should be built, designing the system behind it, and shipping the smallest strong version.</p>
            <Link className="solid-link" href="/about">More about me <span aria-hidden="true">&#8599;</span></Link>
          </div>
        </section>

        <section className="dual-selected panel" aria-labelledby="selected-title">
          <div className="dual-section-heading">
            <p className="section-kicker">Selected work</p>
            <h2 id="selected-title">Where strategy<br />meets <em>execution.</em></h2>
            <p>I selected these products for their portfolio weight, technical depth, product thinking, and evidence of sustained execution.</p>
          </div>

          <div className="dual-work-grid">
            <SelectedProjectCard project={blindspotLab} />
            <SelectedProjectCard project={stackBrief} dark />
          </div>

          <div className="dual-project-list" aria-label="Additional selected projects">
            {projectPreview.map((project) => (
              <article className="dual-project-row" key={project.slug}>
                <ProjectLogo project={project} size="sm" />
                <div>
                  <p className="section-kicker">{prettyCategory(project.category[0])} / {displayProjectStatus(project)}</p>
                  <h3>{project.name}</h3>
                </div>
                <p>{project.description}</p>
                <Link href={`/projects/${project.slug}`} aria-label={`Read ${project.name} project profile`}>&#8599;</Link>
              </article>
            ))}
          </div>

          <Link className="dual-section-link" href="/work">Explore all selected work <span aria-hidden="true">&#8594;</span></Link>
        </section>

        <section className="dual-capabilities panel" aria-labelledby="capabilities-title">
          <div className="dual-section-heading">
            <p className="section-kicker">Capabilities</p>
            <h2 id="capabilities-title" className="capabilities-title">
              <span>Two</span>
              <span>disciplines.</span>
              <em>One product</em>
              <em>practice.</em>
            </h2>
          </div>

          <div className="capability-track capability-track--strategy">
            <div className="capability-track__heading"><span>01</span><h3>Product strategy</h3></div>
            {strategyCapabilities.map(([title, copy]) => <article key={title}><h4>{title}</h4><p>{copy}</p></article>)}
          </div>

          <div className="capability-track capability-track--engineering">
            <div className="capability-track__heading"><span>02</span><h3>Engineering</h3></div>
            {engineeringCapabilities.map(([title, copy]) => <article key={title}><h4>{title}</h4><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="dual-proof panel" aria-labelledby="proof-title">
          <div>
            <p className="section-kicker">Evidence</p>
            <h2 id="proof-title">My work<br /><em>compounds.</em></h2>
          </div>
          <div className="dual-milestones">
            {milestones.map(([number, label]) => <article key={number}><strong>{number}</strong><p>{label}</p></article>)}
          </div>
        </section>

        <section className="dual-principles panel" aria-labelledby="principles-title">
          <div className="dual-section-heading">
            <p className="section-kicker">Product philosophy</p>
            <h2 id="principles-title">The smallest<br /><em>strong move.</em></h2>
            <p>Clear thinking, intentional systems, and evidence-led improvement over unnecessary complexity.</p>
          </div>
          <div className="dual-principle-list">
            {principles.map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <Link className="dual-section-link" href="/approach">Read my DAETO approach <span aria-hidden="true">&#8594;</span></Link>
        </section>

        <section className="dual-projects-cta panel" aria-labelledby="projects-cta-title">
          <p className="section-kicker">Complete build record</p>
          <h2 id="projects-cta-title">40+ products,<br />tools, experiments,<br />and <em>shipped ideas.</em></h2>
          <p>My complete project index preserves confirmed live links, project statuses, paused work, experiments, cultural builds, and selected project profiles without inventing missing details.</p>
          <Link href="/projects">Browse all projects <span aria-hidden="true">&#8599;</span></Link>
        </section>

        <section className="dual-contact" aria-labelledby="contact-title">
          <p className="section-kicker">Contact</p>
          <h2 id="contact-title">Have a useful idea?<br /><em>Let&apos;s make it real.</em></h2>
          <div>
            <p>For AI product engineering, system architecture, product strategy, and selected consulting work.</p>
            <a href="mailto:hello@mojeeb.xyz">hello@mojeeb.xyz <ExternalArrow /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-title"><span>Mojeeb</span><strong>Product Strategist<br />AI Product Engineer</strong></div>
        <nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/work">Selected Work</Link><Link href="/projects">Projects</Link><Link href="/about">About</Link><Link href="/approach">Approach</Link><Link href="/contact">Contact</Link></nav>
        <div className="footer-socials"><a href="https://x.com/MojeebMotion" target="_blank" rel="noopener noreferrer">X</a><a href="https://www.linkedin.com/in/tmojeeb" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/mojeebdev" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://devpost.com/mojeebdev" target="_blank" rel="noopener noreferrer">Devpost</a></div>
        <p>&copy; {new Date().getFullYear()} Mojeeb Titilayo</p>
      </footer>
    </>
  );
}
