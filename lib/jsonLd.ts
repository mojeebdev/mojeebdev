import { projects, selectedProjects, type Project } from "@/lib/projects";
import { BASE_URL, SITE_EMAIL } from "@/lib/site";

const PERSON_ID = `${BASE_URL}/about#person`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const ORGANIZATION_ID = "https://blindspotlab.xyz/#organization";
const HOME_ID = `${BASE_URL}/#webpage`;

const publicProjects = projects.filter((project) => project.url);
const aiPageProjects = projects.filter((project) => project.category.includes("ai") && (project.selected || project.url)).slice(0, 10);

const categoryName = (category: string) => ({
  "developer-tools": "Developer Tool",
  flagship: "Product Platform",
  ai: "AI Application",
  saas: "SaaS Application",
  web3: "Web3 Application",
  hackathon: "Hackathon Project",
  experiment: "Product Experiment",
  cultural: "Cultural Project",
  archival: "Archived Project",
}[category] ?? category);

const personEntity = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Mojeeb Titilayo",
  givenName: "Mojeeb",
  familyName: "Titilayo",
  alternateName: ["MojeebMotion", "tmojeeb", "mojeebdev"],
  url: `${BASE_URL}/about`,
  email: SITE_EMAIL,
  image: {
    "@type": "ImageObject",
    contentUrl: `${BASE_URL}/mojeeb_headshot.png`,
    caption: "Mojeeb Titilayo",
  },
  jobTitle: ["AI Product Engineer", "System Architect", "Product Strategist"],
  description: "Mojeeb Titilayo is an AI Product Engineer, System Architect and Product Strategist building intentional products across AI, SaaS, developer tools and Web3.",
  nationality: { "@type": "Country", name: "Nigeria" },
  homeLocation: { "@type": "Place", name: "Lagos, Nigeria" },
  worksFor: { "@id": ORGANIZATION_ID },
  knowsAbout: [
    "AI product engineering",
    "System architecture",
    "Product strategy",
    "Product positioning",
    "Developer tools",
    "SaaS architecture",
    "Web3 product development",
    "Retrieval-augmented generation",
    "Model Context Protocol integrations",
    "Prompt engineering",
  ],
  sameAs: [
    "https://x.com/MojeebMotion",
    "https://www.linkedin.com/in/tmojeeb",
    "https://github.com/mojeebdev",
    "https://devpost.com/mojeebdev",
    "https://youtube.com/@tmojeeb",
  ],
};

const organizationEntity = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "BlindspotLab",
  url: "https://blindspotlab.xyz",
  description: "An AI-native product studio for turning ideas into designed, engineered and shipped products.",
  founder: { "@id": PERSON_ID },
};

const websiteEntity = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: BASE_URL,
  name: "Mojeeb Titilayo",
  alternateName: "Mojeeb",
  description: "Portfolio of Mojeeb Titilayo, AI Product Engineer, System Architect and Product Strategist.",
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

const breadcrumb = (items: Array<[string, string]>) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: `${BASE_URL}${path}`,
  })),
});

const projectListItem = (project: Project, index: number) => ({
  "@type": "ListItem",
  position: index + 1,
  item: {
    "@type": project.category.includes("cultural") || project.category.includes("archival") ? "CreativeWork" : "SoftwareApplication",
    "@id": project.selected ? `${BASE_URL}/projects/${project.slug}#project` : `${project.url}#project`,
    name: project.name,
    description: project.description,
    url: project.selected ? `${BASE_URL}/projects/${project.slug}` : project.url,
    sameAs: project.url,
    applicationCategory: categoryName(project.category[0]),
    creator: { "@id": PERSON_ID },
  },
});

export const siteGraphJsonLd = {
  "@context": "https://schema.org",
  "@graph": [websiteEntity, personEntity, organizationEntity],
};

export const homePageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": HOME_ID,
      url: BASE_URL,
      name: "Mojeeb Titilayo — Product Strategist and AI Product Engineer",
      description: "Mojeeb Titilayo combines product strategy, AI product engineering and system architecture to build intentional products.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/#selected-work`,
      name: "Selected work by Mojeeb Titilayo",
      numberOfItems: selectedProjects.length,
      itemListElement: selectedProjects.map(projectListItem),
    },
  ],
};

export const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${BASE_URL}/about#profilepage`,
      url: `${BASE_URL}/about`,
      name: "About Mojeeb Titilayo",
      description: "Profile of Mojeeb Titilayo, AI Product Engineer, System Architect and Product Strategist based in Nigeria.",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
      breadcrumb: { "@id": `${BASE_URL}/about#breadcrumb` },
      inLanguage: "en",
    },
    { "@id": `${BASE_URL}/about#breadcrumb`, ...breadcrumb([["Home", ""], ["About", "/about"]]) },
  ],
};

export const workPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/work#webpage`,
      url: `${BASE_URL}/work`,
      name: "Selected Work by Mojeeb Titilayo",
      description: "Selected AI, SaaS, developer-tool and Web3 products built by Mojeeb Titilayo.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": `${BASE_URL}/work#itemlist` },
      breadcrumb: { "@id": `${BASE_URL}/work#breadcrumb` },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/work#itemlist`,
      name: "Selected products",
      numberOfItems: selectedProjects.length,
      itemListElement: selectedProjects.map(projectListItem),
    },
    { "@id": `${BASE_URL}/work#breadcrumb`, ...breadcrumb([["Home", ""], ["Selected Work", "/work"]]) },
  ],
};

export const projectsPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/projects#webpage`,
      url: `${BASE_URL}/projects`,
      name: "Projects and Experiments by Mojeeb Titilayo",
      description: "A complete public index of products, tools, experiments, Web3 builds and cultural projects by Mojeeb Titilayo.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": `${BASE_URL}/projects#itemlist` },
      breadcrumb: { "@id": `${BASE_URL}/projects#breadcrumb` },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/projects#itemlist`,
      name: "Public project index",
      numberOfItems: publicProjects.length,
      itemListElement: publicProjects.map(projectListItem),
    },
    { "@id": `${BASE_URL}/projects#breadcrumb`, ...breadcrumb([["Home", ""], ["Projects", "/projects"]]) },
  ],
};

export const approachPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/approach#webpage`,
      url: `${BASE_URL}/approach`,
      name: "Product Approach and DAETO Framework",
      description: "How Mojeeb Titilayo approaches product discovery, strategy, architecture, execution, tracking and optimisation.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": `${BASE_URL}/approach#daeto` },
      author: { "@id": PERSON_ID },
      breadcrumb: { "@id": `${BASE_URL}/approach#breadcrumb` },
      inLanguage: "en",
    },
    {
      "@type": "DefinedTermSet",
      "@id": `${BASE_URL}/approach#daeto`,
      name: "DAETO Framework",
      description: "A five-stage product framework covering Discovery, Approach, Execution, Tracking and Optimisation.",
      creator: { "@id": PERSON_ID },
      hasDefinedTerm: [
        ["Discovery", "Understand the problem, user, context, constraints and opportunity."],
        ["Approach", "Choose the positioning, architecture and execution path."],
        ["Execution", "Build the smallest strong version with disciplined scope."],
        ["Tracking", "Measure what works, what fails and what people use."],
        ["Optimisation", "Improve from evidence instead of random feature additions."],
      ].map(([name, description]) => ({ "@type": "DefinedTerm", name, description })),
    },
    { "@id": `${BASE_URL}/approach#breadcrumb`, ...breadcrumb([["Home", ""], ["Approach", "/approach"]]) },
  ],
};

export const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${BASE_URL}/contact#webpage`,
      url: `${BASE_URL}/contact`,
      name: "Contact Mojeeb Titilayo",
      description: "Contact Mojeeb Titilayo for AI product engineering, system architecture, product strategy and selected consulting work.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
      breadcrumb: { "@id": `${BASE_URL}/contact#breadcrumb` },
      inLanguage: "en",
    },
    { "@id": `${BASE_URL}/contact#breadcrumb`, ...breadcrumb([["Home", ""], ["Contact", "/contact"]]) },
  ],
};

export const aiPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/ai#webpage`,
      url: `${BASE_URL}/ai`,
      name: "AI Product Engineering by Mojeeb Titilayo",
      description: "Mojeeb Titilayo's AI product engineering work across agents, SaaS, audits, prompt systems and developer workflows.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": `${BASE_URL}/ai#itemlist` },
      breadcrumb: { "@id": `${BASE_URL}/ai#breadcrumb` },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/ai#itemlist`,
      name: "AI products by Mojeeb Titilayo",
      numberOfItems: aiPageProjects.length,
      itemListElement: aiPageProjects.map(projectListItem),
    },
    { "@id": `${BASE_URL}/ai#breadcrumb`, ...breadcrumb([["Home", ""], ["AI", "/ai"]]) },
  ],
};

export const experiencePageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${BASE_URL}/experience#webpage`,
      url: `${BASE_URL}/experience`,
      name: "Experience of Mojeeb Titilayo",
      description: "Mojeeb Titilayo's product strategy, AI engineering, system architecture and Web3 product experience.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
      breadcrumb: { "@id": `${BASE_URL}/experience#breadcrumb` },
      inLanguage: "en",
    },
    { "@id": `${BASE_URL}/experience#breadcrumb`, ...breadcrumb([["Home", ""], ["Experience", "/experience"]]) },
  ],
};

export const projectPageJsonLd = (project: Project) => {
  const pageUrl = `${BASE_URL}/projects/${project.slug}`;
  const projectType = project.category.includes("cultural") || project.category.includes("archival") ? "CreativeWork" : "SoftwareApplication";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${project.name} — Project Profile`,
        description: project.description ?? `A documented project in Mojeeb Titilayo's portfolio.`,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${pageUrl}#project` },
        author: { "@id": PERSON_ID },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: "en",
      },
      {
        "@type": projectType,
        "@id": `${pageUrl}#project`,
        name: project.name,
        description: project.description,
        url: project.url ?? pageUrl,
        mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
        creator: { "@id": PERSON_ID },
        applicationCategory: projectType === "SoftwareApplication" ? categoryName(project.category[0]) : undefined,
        sameAs: [project.url, project.sourceUrl, project.packageUrl].filter(Boolean),
      },
      {
        "@id": `${pageUrl}#breadcrumb`,
        ...breadcrumb([["Home", ""], ["Selected Work", "/work"], [project.name, `/projects/${project.slug}`]]),
      },
    ],
  };
};
