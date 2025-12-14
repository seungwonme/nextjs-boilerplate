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
- Supabase (@supabase/ssr, @supabase/supabase-js)

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

import { verifySession } from '@/shared/lib';
import { signInSchema } from '../model/schemas';

export async function signIn(formData: FormData) {
  // 1. Validate input
  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  // 2. Authenticate (if required for this action)
  const { isAuth } = await verifySession();

  if (!isAuth) {
    return { error: 'Unauthorized' };
  }

  // 3. Perform action
  /* ... */
}

// 배치 위치:
// - Feature-specific: src/features/[feature]/api/actions.ts
// - Entity-specific: src/entities/[entity]/api/actions.ts
// - Shared: src/shared/api/actions.ts
```

### Data Access Layer (DAL)

```typescript
// src/shared/lib/dal.ts - 인증 검증
import { verifySession, requireAuth } from '@/shared/lib';

// Server Components에서
const { isAuth, user } = await verifySession();

// Server Actions에서
const user = await requireAuth(); // throw error if not authenticated
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

### Error Handling

```tsx
import { ErrorBoundary } from '@/shared/ui';

// Wrap components that might throw errors
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## SEO

### 환경 변수

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-verification-code
```

### 파일 구조

| 파일              | 설명                              |
| ----------------- | --------------------------------- |
| `app/layout.tsx`  | 전역 Metadata, Open Graph, 등     |
| `app/robots.ts`   | 검색엔진 크롤러 규칙              |
| `app/sitemap.ts`  | 동적 사이트맵 생성                |
| `app/manifest.ts` | PWA 웹 앱 매니페스트              |

### JSON-LD 구조화 데이터

```typescript
import { JsonLd, createWebSiteJsonLd, createArticleJsonLd } from '@/shared/lib';

// 페이지에서 사용
export default function Page() {
  return (
    <>
      <JsonLd data={createWebSiteJsonLd()} />
      {/* 페이지 컨텐츠 */}
    </>
  );
}
```

### 페이지별 Metadata

```typescript
// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About', // "About | Site Name" 형식으로 출력
  description: 'About page description',
};
```

## Key Paths

| 용도             | 경로                               |
| ---------------- | ---------------------------------- |
| UI 컴포넌트      | `src/shared/ui/`                   |
| 유틸리티         | `src/shared/lib/`                  |
| 훅               | `src/shared/hooks/`                |
| API 클라이언트   | `src/shared/api/`                  |
| Supabase         | `src/shared/api/supabase/`         |
| Auth 기능        | `src/features/auth/`               |
| 아바타 업로드    | `src/features/upload-avatar/`      |
| 사용자 엔티티    | `src/entities/user/`               |
| 테마             | `src/shared/ui/theme-provider.tsx` |
| shadcn 설정      | `components.json`                  |
| Tailwind 설정    | `app/globals.css`                  |
| Supabase 마이그레이션 | `supabase/migrations/`        |

## Supabase Integration

### Quick Start

```bash
# 1. 환경 변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# 2. 마이그레이션 적용
pnpm dlx supabase db push

# 3. 타입 생성
pnpm dlx supabase gen types typescript --local > src/shared/api/supabase/types.ts
```

### 클라이언트 사용

```typescript
// Client Component
"use client";
import { createClient } from '@/shared/api/supabase';

// Server Component/Action
import { createServerClient } from '@/shared/api/supabase';
```

### 주요 기능

- **인증 (Auth)**: `src/features/auth/`
  - SignInForm, SignUpForm, SignOutButton
  - signInWithEmail, signUpWithEmail, signOut, getUser

- **사용자 프로필 (User Profile)**: `src/entities/user/`
  - UserAvatar
  - getProfile, updateProfile

- **아바타 업로드 (Avatar Upload)**: `src/features/upload-avatar/`
  - AvatarUpload
  - uploadAvatar, deleteAvatar

### 데이터베이스 스키마

- **profiles** 테이블: 사용자 프로필 정보
- **RLS 정책**: 자동으로 적용됨
- **자동 트리거**: 회원가입 시 프로필 자동 생성

### Storage

- **avatars** 버킷: 사용자 아바타 이미지
- **RLS 정책**: 공개 읽기, 인증된 사용자만 업로드/수정/삭제

자세한 내용: [docs/SUPABASE_INTEGRATION.md](./docs/SUPABASE_INTEGRATION.md)
