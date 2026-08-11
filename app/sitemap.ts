import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
