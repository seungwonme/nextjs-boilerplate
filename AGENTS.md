# Next.js Boilerplate

## Commands

```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # Biome lint
pnpm check            # Biome lint + format + auto-fix
pnpm lint:fsd         # Steiger FSD architecture lint
pnpm dlx shadcn@latest add <component>  # Add shadcn/ui component
```

## Tech Stack

- Next.js 16, React 19, TypeScript 5
- Tailwind CSS v4 (config in `globals.css` only)
- shadcn/ui (New York style)
- Biome (linter/formatter)
- Steiger (FSD linter)
- next-themes (dark mode)

## Architecture (FSD)

### Layer Structure

```
app/                  # Next.js App Router (routing only)
src/
├── app/              # Providers, global config
├── pages/            # Page composition
├── widgets/          # Header, Footer, Sidebar
├── features/         # auth, checkout, search
├── entities/         # user, product, order
└── shared/           # ui, lib, api, hooks
```

### Import Rules

```typescript
// 의존성 방향: app → pages → widgets → features → entities → shared
// 같은 레이어 내 cross-import 금지

// ✅ Correct - index.ts를 통한 import
import { UserCard } from '@/entities/user';
import { Button } from '@/shared/ui';

// ❌ Wrong - 내부 구조 직접 접근
import { UserCard } from '@/entities/user/ui/user-card';
```

### Next.js + FSD Integration

```typescript
// app/example/page.tsx
export { ExamplePage as default } from '@/pages/example';

// src/pages/example/index.ts
export { ExamplePage } from './ui/example-page';

// src/pages/example/ui/example-page.tsx
import { Header } from '@/widgets/header';
import { AuthForm } from '@/features/auth';
import { Button } from '@/shared/ui';
```

### Server Actions

```typescript
// src/features/auth/api/actions.ts
'use server';
export async function signIn(formData: FormData) {
  /* ... */
}

// 배치 위치:
// - Feature-specific: src/features/[feature]/api/actions.ts
// - Entity-specific: src/entities/[entity]/api/actions.ts
// - Shared: src/shared/api/actions.ts
```

## Conventions

### Naming

| 대상            | 규칙       | 예시            |
| --------------- | ---------- | --------------- |
| 파일명          | kebab-case | `user-card.tsx` |
| 컴포넌트        | PascalCase | `UserCard`      |
| 함수/변수       | camelCase  | `handleClick`   |
| 타입/인터페이스 | PascalCase | `UserProfile`   |

### Components

```typescript
// Server Component (기본)
export function UserCard() {
  /* ... */
}
```

```typescript
// Client Component (상호작용 필요 시)
// 파일 최상단에 directive 선언 필수
"use client";

export function InteractiveForm() {
  /* ... */
}
```

### Icons

```typescript
import { Menu, X } from 'lucide-react'; // 일반 아이콘
import { FaGithub } from 'react-icons/fa'; // 브랜드/SNS 아이콘
```

### Dark Mode

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">Content</div>
```

## Key Paths

| 용도           | 경로                               |
| -------------- | ---------------------------------- |
| UI 컴포넌트    | `src/shared/ui/`                   |
| 유틸리티       | `src/shared/lib/`                  |
| 훅             | `src/shared/hooks/`                |
| API 클라이언트 | `src/shared/api/`                  |
| 테마           | `src/shared/ui/theme-provider.tsx` |
| shadcn 설정    | `components.json`                  |
| Tailwind 설정  | `app/globals.css`                  |
