import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/site";
import { caseStudies } from "@/content/caseStudies";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"], ["/work", 0.9, "weekly"], ["/projects", 0.8, "weekly"], ["/about", 0.8, "monthly"], ["/activity", 0.7, "weekly"],
    ["/lab", 0.6, "monthly"], ["/lab/constellation", 0.5, "monthly"], ["/writing", 0.6, "monthly"], ["/now", 0.6, "weekly"], ["/guestbook", 0.5, "daily"], ["/contact", 0.7, "monthly"],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: `${BASE_URL}${p}`, lastModified: now, changeFrequency, priority })),
    ...caseStudies.map((c) => ({ url: `${BASE_URL}/work/${c.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 })),
  ];
}
