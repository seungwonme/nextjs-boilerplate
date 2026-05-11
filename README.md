# Next.js Boilerplate

Production-ready Next.js starter with TypeScript, Tailwind CSS v4, shadcn/ui (minimal preset), Biome, lefthook, and Feature-Sliced Design.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 (config in `globals.css`) + tw-animate-css
- **UI**: shadcn/ui (New York style, minimal preset — Button + ThemeToggle only)
- **Theme**: next-themes (dark mode via `data-theme` attribute)
- **Lint/Format**: Biome
- **Architecture lint**: Steiger (Feature-Sliced Design)
- **Hooks**: lefthook (pre-commit)
- **Package manager**: pnpm

## Commands

```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # Biome lint
pnpm check            # Biome lint + format + auto-fix
pnpm lint:fsd         # Steiger FSD architecture lint
```

## Branches

| Branch                | Stack add-ons                                                |
| --------------------- | ------------------------------------------------------------ |
| `main`                | Base only (this branch)                                      |
| `supabase`            | Supabase Auth (SSR) + storage + auth pages                   |
| `neon-cloudflare-r2`  | Drizzle ORM + Neon Postgres + Neon Auth + Cloudflare R2      |

Pick the branch that matches your stack and clone from there. Branch variants are kept in sync with `main` for the base stack.

## Project Structure (FSD)

```
app/                  # Next.js App Router (routing only — re-exports from src/pages)
pages/                # Empty placeholder (prevents Next.js Pages Router conflict with src/pages)
src/
├── app/              # Providers, global config
├── pages/            # Page composition (FSD pages layer)
├── widgets/          # Header, Footer, Sidebar
├── features/         # auth, checkout, search
├── entities/         # user, product, order
└── shared/           # ui, lib, api, hooks, config
```

Dependency direction: `app → pages → widgets → features → entities → shared`. No cross-imports within the same layer. See [AGENTS.md](./AGENTS.md) for the full architecture guide.

## Site Configuration

All site metadata lives in `src/shared/config/site.ts` (single source of truth). Update once and `app/layout.tsx`, `robots.ts`, `sitemap.ts`, `manifest.ts`, and JSON-LD helpers all pick it up:

```ts
// src/shared/config/site.ts
export const siteConfig = {
  name: "Your App",
  description: "...",
  url: publicEnv.siteUrl,
  locale: "ko_KR",
  lang: "ko",
  author: { name: "Your Name", url: "https://..." },
  // ...
};
```

Environment variables go in `.env.local` (see `.env.example`):

```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="..."
```

Typed access via `publicEnv` in `src/shared/config/env.ts`.

## Adding shadcn/ui Components

The base ships with Button + ThemeProvider/ThemeToggle. Add more on demand:

```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add input form
```

Components install into `src/shared/ui/` and need to be re-exported from `src/shared/ui/index.ts`.

## Next.js Upgrade

Use the official codemod:

```bash
pnpm dlx @next/codemod@canary upgrade latest
pnpm install
pnpm build
pnpm lint
```

If already on the target version, the codemod reports no upgrade needed.

## Deploy on Vercel

The easiest way is the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for other targets.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
