import { publicEnv } from "./env";

// Single source of truth for site-wide metadata.
// Update these fields per project; downstream code (layout, sitemap,
// robots, manifest, JSON-LD) reads from here.

export const siteConfig = {
  name: "Next.js Boilerplate",
  description:
    "Production-ready Next.js boilerplate with TypeScript, Tailwind CSS, and shadcn/ui",
  url: publicEnv.siteUrl,
  locale: "ko_KR",
  lang: "ko",
  author: {
    name: "Aiden Ahn",
    url: "https://github.com/seungwonme",
  },
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  ogImage: "/og-image.png",
  themeColor: {
    light: "#ffffff",
    dark: "#000000",
  },
} as const;

export type SiteConfig = typeof siteConfig;
