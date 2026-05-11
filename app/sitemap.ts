import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/contact"].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // TODO: 동적 페이지가 있다면 여기에 추가
  // 예: 블로그 포스트, 제품 페이지 등
  // const posts = await getPosts();
  // const postRoutes = posts.map((post) => ({
  //   url: `${siteConfig.url}/blog/${post.slug}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: "monthly" as const,
  //   priority: 0.6,
  // }));

  return [...routes];
}
