import { publicEnv } from "./env.ts";

export const siteConfig = {
  name: "Next.js Boilerplate",
  description:
    "Production-ready Next.js boilerplate with TypeScript, Tailwind CSS, and shadcn/ui",
  url: publicEnv.siteUrl,
  locale: "ko_KR",
  lang: "ko",
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  ogImage: "/og-image.png",
  themeColor: {
    light: "#ffffff",
    dark: "#000000",
  },
} as const;

export type SiteConfig = typeof siteConfig;
