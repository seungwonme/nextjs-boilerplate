# NextJS Convention

## Package Manager

pnpm을 사용합니다.
만약 pnpm 에러가 난다면 `npm install -g pnpm` 명령어로 pnpm을 설치합니다.

## File Name Convention

- 모든 파일명은 `kebab-case` 로 작성합니다.
- `not-found.tsx`, `mdx-components.tsx` 처럼, 최대한 간결하게 하되, 단어 사이는 하이픈으로 연결합니다.

## Function/Variable Convention

- `camelCase` 로 작성합니다.
- TypeScript 타입은 반드시 정의해야 합니다.

## Component Convention

- Component 명은 `PascalCase` 로 작성합니다. (Component 파일명도 예외없이 `kebab-case`로 작성합니다)
- Component는 재사용 가능하도록 설계해야 합니다.

## Directory Convention (Feature-Sliced Design)

[Feature-Sliced Design (FSD)](https://feature-sliced.design/docs/guides/tech/with-nextjs)을 Next.js App Router와 통합하여 사용합니다.

### 프로젝트 구조

```
├── app/                     # Next.js App Router (라우팅 전용)
│   ├── (routes)/            # 라우트 그룹
│   │   └── example/
│   │       └── page.tsx     # FSD pages에서 re-export
│   ├── api/                 # API Route Handlers
│   ├── layout.tsx
│   └── globals.css
├── pages/                   # 빈 폴더 (Next.js가 src/pages를 Pages Router로 인식하지 않도록)
│   └── README.md
└── src/
    ├── app/                 # FSD App Layer - 앱 초기화, 프로바이더, 전역 설정
    │   ├── providers/       # React Context Providers
    │   ├── styles/          # 전역 스타일 (필요시)
    │   └── api-routes/      # API route handlers 로직
    ├── pages/               # FSD Pages Layer - 페이지 컴포넌트 조합
    │   └── example/
    │       ├── index.ts     # Public API
    │       └── ui/
    │           └── example-page.tsx
    ├── widgets/             # 독립적인 UI 블록 (Header, Sidebar, Footer...)
    │   └── header/
    │       ├── index.ts
    │       ├── ui/
    │       └── model/
    ├── features/            # 사용자 시나리오/기능 (auth, checkout, search...)
    │   └── auth/
    │       ├── index.ts     # Public API
    │       ├── ui/          # Feature UI 컴포넌트
    │       ├── model/       # 비즈니스 로직, 상태
    │       ├── api/         # API 요청
    │       └── lib/         # Feature 유틸리티
    ├── entities/            # 비즈니스 엔티티 (user, product, order...)
    │   └── user/
    │       ├── index.ts     # Public API
    │       ├── ui/          # Entity UI 컴포넌트
    │       ├── model/       # Entity 타입, 스토어
    │       └── api/         # Entity API
    └── shared/              # 공유 리소스 (재사용 가능한 코드)
        ├── ui/              # 공용 UI 컴포넌트 (Button, Input, Modal...)
        ├── lib/             # 유틸리티 함수, 헬퍼
        ├── api/             # API 클라이언트 (supabase/client.ts, supabase/server.ts)
        ├── config/          # 상수, 환경변수, 설정
        └── model/           # 전역 상태 (Jotai atoms)
```

### FSD 레이어 규칙

1. **의존성 방향**: 상위 레이어 → 하위 레이어만 import 가능

   - `app` → `pages` → `widgets` → `features` → `entities` → `shared`
   - 같은 레이어 내 슬라이스 간 import 금지 (cross-import 금지)

2. **Public API**: 각 슬라이스는 `index.ts`를 통해서만 외부에 노출

   ```typescript
   // ✅ 올바른 import
   import { UserCard } from '@/entities/user';
   // ❌ 잘못된 import (내부 구조 직접 접근)
   import { UserCard } from '@/entities/user/ui/user-card';
   ```

3. **Segment 구조**: 각 슬라이스 내 세그먼트
   - `ui/` - UI 컴포넌트
   - `model/` - 비즈니스 로직, 상태 관리
   - `api/` - API 요청 로직
   - `lib/` - 유틸리티 함수
   - `config/` - 설정값

### Next.js App Router와 FSD 통합

```typescript
// app/example/page.tsx - Next.js 라우트에서 FSD 페이지 re-export
export { ExamplePage as default, metadata } from '@/pages/example';
```

```typescript
// src/pages/example/index.ts - FSD 페이지 Public API
export { ExamplePage } from './ui/example-page';
export { metadata } from './config';
```

```typescript
// src/pages/example/ui/example-page.tsx
import { Header } from '@/widgets/header';
import { AuthForm } from '@/features/auth';
import { UserCard } from '@/entities/user';
import { Button } from '@/shared/ui';

export function ExamplePage() {
  return (
    <>
      <Header />
      <main>
        <AuthForm />
        <UserCard />
        <Button>Click me</Button>
      </main>
    </>
  );
}
```

### Server Actions 배치

- **Feature-specific**: `src/features/[feature]/api/actions.ts`
- **Entity-specific**: `src/entities/[entity]/api/actions.ts`
- **Shared/Global**: `src/shared/api/actions.ts`

```typescript
// src/features/auth/api/actions.ts
'use server';

export async function signIn(formData: FormData) {
  // ...
}
```

## Package Convention

### Vitest

#### 설치

```sh
pnpm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

#### vitest.config.mts

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
});
```

#### package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest" // 추가
  }
}
```

#### 테스트 예시: `__tests__/page.test.tsx`

```tsx
import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

test('Page', () => {
  render(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined();
});
```

### Biome (Linting & Formatting)

- ESLint/Prettier 대신 Biome을 사용합니다.
- Rust 기반으로 10~100배 빠른 성능을 제공합니다.
- 설정 파일: `biome.json`

```bash
# 린트
pnpm lint

# 포맷팅
pnpm format

# 린트 + 포맷팅 + 자동 수정
pnpm check
```

### Steiger (FSD Linter)

- FSD 공식 린터로 레이어 간 의존성 방향을 강제합니다.
- 잘못된 cross-import를 자동으로 감지합니다.

```bash
pnpm lint:fsd
```

### Lefthook (Git Hooks)

- Biome 공식 권장 Git hooks 도구입니다.
- Go 기반으로 Husky 대비 빠른 성능을 제공합니다.
- 설정 파일: `lefthook.yml`

### TailwindCSS

- 모든 스타일은 TailwindCSS를 사용해야 합니다.
- TailwindCSS v4 버전을 사용합니다. 그러므로 `tailwind.config.js`, `tailwind.config.ts` 파일은 사용하지 않고 `globals.css` 파일만을 사용합니다.

### Dark Mode

- `next-themes` 라이브러리를 사용합니다.
- Tailwind CSS v4의 `@custom-variant`와 `data-theme` 속성을 활용합니다.
- light/dark/system 3가지 테마를 지원합니다.

```css
/* globals.css - next-themes 연동 */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

```tsx
// 다크 모드 스타일 적용
<div className="bg-white dark:bg-black text-black dark:text-white">
  Content
</div>
```

### ShadCN Component

- 모든 UI 컴포넌트는 ShadCN을 사용해야 합니다.
- New York 스타일을 사용합니다.
- 컴포넌트 사용 전 설치 여부를 확인해야 합니다: `src/shared/ui` 디렉토리 체크
- 컴포넌트 설치 명령어를 사용해야 합니다: `pnpm dlx shadcn@latest add [component-name]`
- `components.json` 설정에서 경로를 FSD 구조에 맞게 설정:
  ```json
  {
    "aliases": {
      "components": "@/shared/ui",
      "utils": "@/shared/lib/utils",
      "ui": "@/shared/ui",
      "lib": "@/shared/lib",
      "hooks": "@/shared/hooks"
    }
  }
  ```

### Icons (lucide-react + react-icons)

- **lucide-react**: ShadCN 컴포넌트 기본 아이콘으로 사용합니다.
- **react-icons**: SNS 로고, 브랜드 아이콘 등 lucide에 없는 아이콘 보완용으로 사용합니다.

```tsx
// lucide-react (일반 아이콘)
import { Menu, X, Sun, Moon } from 'lucide-react';

// react-icons (브랜드/SNS 아이콘)
import { FaGithub, FaTwitter } from 'react-icons/fa';
import { LuMonitor } from 'react-icons/lu';
```

> **Note**: ShadCN 컴포넌트가 lucide-react를 기본으로 사용하므로 전부 교체하기 어려움. react-icons는 lucide에 없는 아이콘이 필요할 때만 사용.

### Form & Validation

- **react-hook-form**: 비제어 컴포넌트 기반으로 리렌더링을 최소화합니다.
- **zod**: TypeScript 네이티브 스키마 검증, react-hook-form과 완벽 통합됩니다.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

### Jotai

- 전역 상태관리 라이브러리는 Jotai를 사용해야 합니다.

### React Query

- 데이터 패칭 라이브러리는 React Query를 사용해야 합니다.

### React Slick

- 슬라이드 컴포넌트는 React Slick를 사용해야 합니다.

```shell
pnpm add react-slick
```

### Supabase

- 데이터베이스는 Supabase를 사용해야 하며 `@supabase/supabase-js`를 사용해야 합니다.
- 사용자 인증은 Supabase Auth를 사용해야 하며 `@supabase/ssr`를 사용해야 합니다.
- 클라이언트 파일은 `src/shared/api/supabase/` 폴더에 넣어야 합니다.
  ```
  src/shared/api/supabase/
  ├── client.ts    # 브라우저용 Supabase 클라이언트
  ├── server.ts    # 서버용 Supabase 클라이언트
  └── middleware.ts # Middleware용 클라이언트 (필요시)
  ```

## Analysis Process

Before responding to any request, follow these steps:

1. Request Analysis

   - Determine task type (code creation, debugging, architecture, etc.)
   - Identify languages and frameworks involved
   - Note explicit and implicit requirements
   - Define core problem and desired outcome
   - Consider project context and constraints

2. Solution Planning

   - Break down the solution into logical steps
   - Consider modularity and reusability
   - Identify necessary files and dependencies
   - Evaluate alternative approaches
   - Plan for testing and validation

3. Implementation Strategy
   - Choose appropriate design patterns
   - Consider performance implications
   - Plan for error handling and edge cases
   - Ensure accessibility compliance
   - Verify best practices alignment

## Feature Implementation Workflow

기능을 구현할 때는 **반드시** 다음의 조건과 단계를 따릅니다:

1. **계획 수립 및 검토:**

- 요구사항 분석을 바탕으로 구체적인 구현 계획을 세웁니다.
- 수립된 계획을 사용자에게 제시하고, 진행 전에 반드시 검토와 승인을 받습니다.

2. **단계적 구현 및 검증:**

- 기능 구현 과정을 논리적인 작은 단위로 세분화하여 단계적으로 진행합니다.
- 각 단계의 핵심 로직에는 서버 및 클라이언트 환경 모두에 로그(예: `console.group`, `console.log`)를 추가합니다.
  - 로그는 기능의 정상 작동 여부를 확인하고, 잠재적인 문제를 조기에 발견하여 디버깅하는 데 활용됩니다.
  - 구현이 완료되고 안정화된 후에는 디버깅 목적의 로그는 제거하거나, 필요한 경우 최소한으로 유지하는 것을 고려합니다.
- 각 단계 구현 후에는 충분한 테스트와 검증을 통해 의도한 대로 작동하는지 확인합니다.

## Code Style and Structure

### General Principles

- Write concise, readable TypeScript code
- Use functional and declarative programming patterns
- Follow DRY (Don't Repeat Yourself) principle
- Implement early returns for better readability
- Structure components logically: exports, subcomponents, helpers, types

### Naming Conventions

- Use kebab-case for directory names (e.g., components/auth-form) and PascalCase for component files.
- Use descriptive names with auxiliary verbs (isLoading, hasError)
- Prefix event handlers with "handle" (handleClick, handleSubmit)
- Prefer named exports over default exports, i.e. export function Button() { / ... / } instead of export default function Button() { / ... \*/ }.

### TypeScript Usage

- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums; use const maps instead
- Implement proper type safety and inference
- Use satisfies operator for type validation

## React 19 and Next.js 15 Best Practices

### Component Architecture

- Use the App Router structure with page.tsx files in route directories.
- Keep most components as React Server Components (RSC)
- Client components must be explicitly marked with 'use client' at the top of the file.
- Minimize 'use client' directives
- Create small client component wrappers around interactive elements
- Only use client components when you need interactivity and wrap in Suspense with fallback UI
- Implement proper error boundaries
- Use server components for data fetching
- Use Suspense for async operations
- Optimize for performance and Web Vitals

### State Management

- Avoid unnecessary useState and useEffect when possible
- Use React Server Actions for form handling
- Use URL search params for shareable state
- Use nuqs for URL search param state management

### Async Request APIs

```typescript
// Always use async versions of runtime APIs
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Handle async params in layouts/pages
const params = await props.params;
const searchParams = await props.searchParams;
```
