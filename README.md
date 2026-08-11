# Next.js Boilerplate

Minimal Next.js 16 starter with React 19, strict TypeScript 7, Tailwind CSS
v4, Biome, Lefthook, and Feature-Sliced Design (FSD).

`README.md` is the source of truth for setup and verification. Project coding
boundaries live in [`AGENTS.md`](./AGENTS.md).

## Requirements

- Node.js 24, pinned in `.node-version`
- pnpm 11.21.0, pinned in `package.json`

## Quick Start

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `pnpm install` also
installs the portable pre-commit checks.

## Commands

```bash
pnpm dev           # Development server
pnpm build         # Production build
pnpm validate      # Non-writing Biome lint and format check
pnpm check         # Apply Biome fixes
pnpm typecheck     # Strict TypeScript check
pnpm lint:fsd      # FSD boundary check
pnpm test          # Small regression checks
pnpm audit --audit-level high
```

## Branches

| Branch | Additions |
| --- | --- |
| `main` | Base starter |
| `supabase` | Supabase SSR email auth and protected routes |
| `neon-cloudflare-r2` | Neon Postgres, authentication, and private Cloudflare R2 |

`main` is canonical. Provider branches contain every `main` commit and add
only provider-specific commits, so moving from `main` to a provider branch is
fast-forwardable.

## Project Structure

```text
app/                  # Next.js App Router files
pages/                # Prevents a src/pages Pages Router collision
src/
├── app/              # Providers and application configuration
├── pages/            # Page composition
├── widgets/          # Reusable page sections
├── features/         # User actions
├── entities/         # Domain objects
└── shared/           # UI, libraries, APIs, hooks, and configuration
```

Dependencies point downward:
`app -> pages -> widgets -> features -> entities -> shared`. Import each slice
through its `index.ts` public API.

## Site Configuration

Edit `src/shared/config/site.ts` for project metadata. Development falls back
to `http://localhost:3000`; production builds require a public HTTP(S) origin:

```bash
NEXT_PUBLIC_SITE_URL="https://example.com"
```

The root layout, robots, sitemap, and manifest all use that origin. The base
sitemap contains only the existing `/` route.

## UI Components

The base includes Button, ThemeProvider, and ThemeToggle. Add other shadcn/ui
components only when used:

```bash
pnpm dlx shadcn@latest add dialog
```

Re-export installed components from `src/shared/ui/index.ts`.

## Verification

GitHub Actions runs a frozen install, non-writing Biome check, TypeScript,
FSD, regression checks, production build, and high-severity audit on all three
branches. Local agent rules and MCP servers are intentionally untracked; add
them per developer instead of committing runner-specific configuration.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin, then run:

```bash
pnpm build
pnpm start
```

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for platform-specific settings.
