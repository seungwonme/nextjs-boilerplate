# Next.js Boilerplate Development Contract

`README.md` is the setup and verification source of truth. Keep this file
limited to project-specific coding boundaries.

## Commands

```bash
pnpm dev
pnpm build
pnpm validate
pnpm check
pnpm typecheck
pnpm lint:fsd
pnpm test
pnpm audit --audit-level high
```

Use pnpm for dependency changes so `package.json` and `pnpm-lock.yaml` stay in
sync. Do not hand-edit dependency versions.

## Stack

- Next.js 16 App Router and React 19
- TypeScript 7 with strict mode
- Supabase SSR authentication
- Tailwind CSS v4 and next-themes
- Biome, Steiger, and Lefthook

## Architecture

The root `app/` directory contains routing only. Compose pages under
`src/pages` and keep dependencies moving downward:

```text
app -> pages -> widgets -> features -> entities -> shared
```

- Import slices through their `index.ts` public API.
- Do not cross-import between slices in the same layer.
- Put feature actions in `src/features/<slice>/api`.
- Put entity operations in `src/entities/<slice>/api`.
- Export provider clients through `src/shared/api/index.ts`.

## Supabase

- Use `@supabase/ssr` with `getAll` and `setAll` cookie adapters.
- Do not use deprecated `@supabase/auth-helpers-nextjs` clients.
- Keep browser, server, and proxy clients request-scoped.
- Use `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for runtime configuration.
- This branch includes Auth only. Add database, profile, and Storage examples
  only with a real consumer and operation-specific RLS policies.

## Conventions

- Files use kebab-case; components use PascalCase; functions use camelCase.
- Server Components are the default. Add `"use client"` only for browser
  state, effects, or event handlers.
- Keep environment validation at the server or build boundary. Production
  requires `NEXT_PUBLIC_SITE_URL` to be a public HTTP(S) origin.
- Preserve keyboard focus, accessible names, input validation, and refreshed
  session cookies when changing UI or authentication flows.
- Add shadcn/ui source and dependencies only when used.
- Run `pnpm validate`, `pnpm typecheck`, `pnpm lint:fsd`, `pnpm test`, and a
  production build before committing.

Runner-specific skills, prompt history, MCP configuration, and personal paths
do not belong in the public template.
