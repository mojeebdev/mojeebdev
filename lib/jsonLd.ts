import { BASE_URL } from "@/lib/site";
import { contact, person, portrait, studio } from "@/content/site";
import type { CaseStudy } from "@/content/caseStudies";
import { flagshipPackages } from "@/content/tools";

export const PERSON_ID = `${BASE_URL}/#person`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const ORG_ID = "https://blindspotlab.xyz/#organization";

export const personEntity = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: person.name,
  givenName: person.givenName,
  familyName: person.familyName,
  alternateName: ["mojeebdev", "MojeebMotion"],
  url: BASE_URL,
  email: `mailto:${contact.personalEmail}`,
  image: { "@type": "ImageObject", contentUrl: `${BASE_URL}${portrait.src}`, caption: portrait.alt },
  jobTitle: "Product Engineer and Strategist",
  disambiguatingDescription: "Founder of BlindspotLab. Creator of Arcapush.",
  description: person.summary,
  homeLocation: { "@type": "Place", name: person.location },
  founder: { "@id": ORG_ID },
  worksFor: { "@id": ORG_ID },
  knowsAbout: ["Product engineering", "Product strategy", "Systems architecture", "Developer tooling", "AI-native products", "Model Context Protocol", "Prompt engineering", "Smart contracts"],
  sameAs: [contact.github, contact.x, contact.linkedin],
};

const orgEntity = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: studio.name,
  legalName: studio.legalName,
  url: studio.url,
  foundingDate: studio.incorporated,
  identifier: studio.registration,
  address: { "@type": "PostalAddress", addressCountry: "NG" },
  founder: { "@id": PERSON_ID },
};

const arcapushEntity = {
  "@type": "WebApplication",
  "@id": "https://arcapush.com/#app",
  name: "Arcapush",
  url: "https://arcapush.com",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "A discovery and distribution registry for products, AI agents and hackathon builds.",
  creator: { "@id": PERSON_ID },
  publisher: { "@id": ORG_ID },
  dateCreated: "2026-02",
};

export const siteGraphJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    personEntity,
    orgEntity,
    arcapushEntity,
    { "@type": "WebSite", "@id": WEBSITE_ID, url: BASE_URL, name: person.name, inLanguage: "en", publisher: { "@id": PERSON_ID } },
  ],
};

export const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${BASE_URL}/#profile`,
  url: BASE_URL,
  name: `${person.name}, ${person.role}`,
  mainEntity: { "@id": PERSON_ID },
  isPartOf: { "@id": WEBSITE_ID },
  hasPart: flagshipPackages.map((p) => ({
    "@type": "SoftwareApplication",
    name: p.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform (Node.js)",
    url: p.site,
    codeRepository: p.repo,
    downloadUrl: `https://www.npmjs.com/package/${p.pkg}`,
    author: { "@id": PERSON_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  })),
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${BASE_URL}${it.path}` })),
  };
}

export function caseStudyJsonLd(c: CaseStudy) {
  const isSoftware = c.slug === "stackbrief" || c.slug === "stylegraft";
  return {
    "@context": "https://schema.org",
    "@type": isSoftware ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${BASE_URL}/work/${c.slug}#work`,
    name: c.title,
    description: c.dek,
    url: `${BASE_URL}/work/${c.slug}`,
    creator: { "@id": PERSON_ID },
    ...(isSoftware ? { codeRepository: c.links.find((l) => l.label === "Source")?.href, programmingLanguage: "TypeScript", license: "https://opensource.org/licenses/MIT" } : {}),
    sameAs: c.links.map((l) => l.href),
  };
}
