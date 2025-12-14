import type {
  Article,
  BreadcrumbList,
  FAQPage,
  Organization,
  Person,
  Product,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const SITE_NAME = "Next.js Boilerplate";

type JsonLdType =
  | WithContext<WebSite>
  | WithContext<WebPage>
  | WithContext<Article>
  | WithContext<Organization>
  | WithContext<Person>
  | WithContext<BreadcrumbList>
  | WithContext<Product>
  | WithContext<FAQPage>;

interface JsonLdProps {
  data: JsonLdType;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function createWebSiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

interface WebPageJsonLdOptions {
  title: string;
  description: string;
  url: string;
}

export function createWebPageJsonLd(
  options: WebPageJsonLdOptions,
): WithContext<WebPage> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    description: options.description,
    url: options.url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

interface ArticleJsonLdOptions {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}

export function createArticleJsonLd(
  options: ArticleJsonLdOptions,
): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    url: options.url,
    image: options.image,
    datePublished: options.datePublished,
    dateModified: options.dateModified || options.datePublished,
    author: {
      "@type": "Person",
      name: options.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbJsonLd(
  items: BreadcrumbItem[],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface OrganizationJsonLdOptions {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export function createOrganizationJsonLd(
  options: OrganizationJsonLdOptions,
): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: options.name,
    url: options.url,
    logo: options.logo,
    sameAs: options.sameAs,
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

export function createFAQJsonLd(items: FAQItem[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
