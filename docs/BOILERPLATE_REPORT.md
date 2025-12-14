# Next.js Boilerplate 구축 가이드

이 문서는 Next.js Boilerplate를 **처음부터 재현**할 수 있도록 작성되었습니다.

---

## 목차

1. [기술 스택 및 선정 근거](#1-기술-스택-및-선정-근거)
2. [Step 1: 프로젝트 초기화](#step-1-프로젝트-초기화)
3. [Step 2: 기본 설정 커스터마이징](#step-2-기본-설정-커스터마이징)
4. [Step 3: Biome 설정 (ESLint/Prettier 대체)](#step-3-biome-설정-eslintprettier-대체)
5. [Step 4: Lefthook 설정 (Git Hooks)](#step-4-lefthook-설정-git-hooks)
6. [Step 5: FSD 아키텍처 적용](#step-5-fsd-아키텍처-적용)
7. [Step 6: 다크 모드 구현](#step-6-다크-모드-구현)
8. [Step 7: ShadCN UI 컴포넌트](#step-7-shadcn-ui-컴포넌트)
9. [Step 8: SEO 설정](#step-8-seo-설정)
10. [향후 확장 계획](#향후-확장-계획)

---

## 1. 기술 스택 및 선정 근거

### Core

| 기술           | 버전 | 선정 근거                                           |
| -------------- | ---- | --------------------------------------------------- |
| **Next.js**    | 16.x | React 메타프레임워크, App Router, Server Components |
| **React**      | 19.x | 최신 안정 버전, Concurrent Features                 |
| **TypeScript** | 5.x  | 타입 안정성, DX 향상                                |
| **pnpm**       | -    | 디스크 효율성, 엄격한 의존성 관리, 빠른 설치 속도   |

### Styling

| 기술             | 버전  | 선정 근거                                                                          |
| ---------------- | ----- | ---------------------------------------------------------------------------------- |
| **Tailwind CSS** | 4.x   | 유틸리티 퍼스트, v4의 새로운 `@theme` 시스템, CSS-in-JS 대비 빠른 런타임           |
| **next-themes**  | 0.4.x | Next.js 다크모드 de facto 표준, SSR hydration mismatch 자동 해결, Vercel 공식 추천 |

### Linting & Formatting

| 기술        | 버전  | 선정 근거                                                                |
| ----------- | ----- | ------------------------------------------------------------------------ |
| **Biome**   | 2.x   | ESLint + Prettier 통합 대체, Rust 기반으로 10~100배 빠른 성능, 최신 스택 |
| **Steiger** | 0.5.x | FSD 공식 린터, 레이어 간 의존성 방향 강제, 잘못된 cross-import 자동 감지 |

### Git Hooks

| 기술         | 버전 | 선정 근거                                                        |
| ------------ | ---- | ---------------------------------------------------------------- |
| **Lefthook** | 2.x  | Biome 공식 권장 Git hooks 도구, Go 기반으로 Husky 대비 빠른 성능 |

### UI Components

| 기술             | 버전    | 선정 근거                                                                         |
| ---------------- | ------- | --------------------------------------------------------------------------------- |
| **ShadCN**       | -       | Radix UI 기반 복사-붙여넣기 방식, 완전한 커스터마이징 가능, Tailwind CSS 네이티브 |
| **Radix UI**     | -       | 접근성(a11y) 완벽 지원, Headless UI primitives                                    |
| **lucide-react** | 0.561.x | ShadCN 기본 아이콘 (ShadCN 컴포넌트 내부에서 사용)                                |
| **react-icons**  | 5.x     | SNS 로고 등 다양한 브랜드/서비스 아이콘 제공, lucide에 없는 아이콘 보완용         |

> **아이콘 병행 사용 이유**: ShadCN 컴포넌트가 lucide-react를 기본으로 사용하므로 전부 교체하기 어려움. react-icons는 SNS 로고, 브랜드 아이콘 등 lucide에 없는 아이콘이 필요할 때 사용.

### Form & Validation

| 기술                | 버전 | 선정 근거                                                    |
| ------------------- | ---- | ------------------------------------------------------------ |
| **react-hook-form** | 7.x  | 비제어 컴포넌트 기반으로 리렌더링 최소화, 높은 성능          |
| **zod**             | 4.x  | TypeScript 네이티브 스키마 검증, react-hook-form과 완벽 통합 |

---

## Step 1: 프로젝트 초기화

### 1.1 Next.js 프로젝트 생성

```bash
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

선택 옵션:

- TypeScript: Yes
- ESLint: Yes (나중에 Biome으로 교체)
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Turbopack: Yes (권장)
- Import alias: `@/*`

### 1.2 생성되는 주요 파일

```
├── src/
│   └── app/
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Step 2: 기본 설정 커스터마이징

### 2.1 한국어 로케일 설정

`src/app/layout.tsx`:

```tsx
<html lang="ko">
```

### 2.2 TypeScript 설정 완화 (빠른 프로토타이핑용)

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "forceConsistentCasingInFileNames": false,
    "strictNullChecks": true
  }
}
```

> **Note**: 프로토타이핑 단계에서는 타입 체크를 완화하고, 프로덕션 전환 시 `strict: true`로 변경 권장

### 2.3 기본 페이지 템플릿 간소화

`src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Boilerplate Next.js</h1>
    </div>
  );
}
```

### 2.4 (선택) repomix 설정 추가

AI 컨텍스트 생성용 설정:

```bash
touch repomix.config.json .repomixignore
```

`repomix.config.json`:

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx", "*.md"],
  "ignore": {
    "customPatterns": ["**/*.test.ts", "dist/**", ".next/**"]
  },
  "output": {
    "compress": true
  }
}
```

### 2.5 Node.js 버전 고정

`.node-version` 파일을 사용하여 프로젝트의 Node.js 버전을 고정합니다:

```bash
node -v > .node-version
```

> **Note**: `.node-version`은 `.nvmrc`보다 더 범용적입니다. fnm, nvm, nodenv, asdf, mise 등 대부분의 Node 버전 관리자가 지원합니다. fnm 사용 시 `--use-on-cd` 옵션으로 디렉토리 이동 시 자동 버전 전환이 가능합니다.

---

## Step 3: Biome 설정 (ESLint/Prettier 대체)

### 3.1 Biome 설치

```bash
pnpm add -D @biomejs/biome
```

### 3.2 Biome 초기화 및 마이그레이션

```bash
# Biome 설정 파일 생성
bunx @biomejs/biome init

# 기존 Prettier 설정 마이그레이션
bunx @biomejs/biome migrate prettier --write

# 기존 ESLint 설정 마이그레이션
bunx @biomejs/biome migrate eslint --write
```

### 3.3 ESLint/Prettier 의존성 및 파일 제거

```bash
# 의존성 제거
pnpm remove eslint eslint-config-next

# 설정 파일 제거
rm .prettierrc .prettierignore eslint.config.mjs
```

### 3.4 Biome 설정 파일

주요 설정:

- `formatter`: space indent, LF line ending, 80 line width
- `linter`: recommended + React hooks 규칙, `noExplicitAny: off`
- `overrides`: `src/shared/ui/**`에서 ShadCN 관련 규칙 비활성화

> 전체 설정: `biome.json` 참조

### 3.5 package.json 스크립트 업데이트

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write ."
  }
}
```

### 3.6 설정 확인

```bash
pnpm check
```

> **Note**: `pnpm check`으로 린팅과 포맷팅이 정상적으로 작동하는지 확인합니다. 오류가 있으면 자동으로 수정됩니다.

---

## Step 4: Lefthook 설정 (Git Hooks)

### 4.1 Lefthook 설치

```bash
pnpm add -D lefthook
pnpm lefthook install
```

### 4.2 Lefthook 설정 파일 생성

`pre-commit` 훅 구성:

- `biome-check`: 린팅/포맷팅 자동 수정
- `typecheck`: TypeScript 타입 체크
- `prevent-env`: `.env` 파일 커밋 방지 (`.env.example` 제외)
- `trailing-whitespace`: 후행 공백 제거
- `check-merge-conflict`: 병합 충돌 마커 검사
- `detect-private-key`: 개인키 유출 방지

> 전체 설정: `lefthook.yml` 참조

---

## Step 5: FSD 아키텍처 적용

### 5.1 Steiger 설치 (FSD 린터)

```bash
pnpm add -D steiger @feature-sliced/steiger-plugin
```

### 5.2 FSD 디렉토리 구조 생성

```bash
# FSD 레이어 생성
mkdir -p src/{app,pages,widgets,features,entities,shared}/{ui,model,api,lib,config}

# 빈 폴더 Git 추적을 위한 .gitkeep 추가
touch src/app/.gitkeep
touch src/widgets/.gitkeep
touch src/features/.gitkeep
touch src/entities/.gitkeep
touch src/shared/{api,config,model}/.gitkeep

# Next.js Pages Router 방지용 빈 폴더
mkdir -p pages
echo "# Pages Directory

이 폴더는 Next.js가 \`src/pages\`를 Pages Router로 인식하는 것을 방지하기 위한 빈 폴더입니다.

실제 페이지 컴포넌트는 \`src/pages/\` (FSD Pages Layer)에 있습니다.

참고: [FSD + Next.js 통합 가이드](https://feature-sliced.design/docs/guides/tech/with-nextjs)" > pages/README.md
```

### 5.3 Next.js 라우팅 파일 이동

```bash
# app 디렉토리를 루트로 이동
mv src/app app
```

최종 구조:

```
├── app/                  # Next.js 라우팅 (re-export만)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── pages/                # 빈 폴더 (Pages Router 방지)
│   └── README.md
└── src/
    ├── app/              # FSD App Layer - 프로바이더, 전역 설정
    ├── pages/            # FSD Pages Layer - 페이지 컴포넌트 조합
    ├── widgets/          # 독립적인 UI 블록
    ├── features/         # 사용자 기능
    ├── entities/         # 비즈니스 엔티티
    └── shared/           # 공유 리소스
        ├── ui/           # 공용 UI 컴포넌트
        ├── lib/          # 유틸리티 함수
        ├── api/          # API 클라이언트
        ├── config/       # 설정값
        └── model/        # 전역 상태
```

### 5.4 TypeScript Path Alias 설정

`tsconfig.json`에 추가:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/widgets/*": ["./src/widgets/*"],
      "@/features/*": ["./src/features/*"],
      "@/entities/*": ["./src/entities/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

### 5.5 Steiger 설정

`steiger.config.ts`:

```typescript
import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next.js 라우팅 디렉토리는 제외
    ignores: ['app/**', 'pages/**'],
  },
]);
```

### 5.6 package.json에 FSD 린트 스크립트 추가

```json
{
  "scripts": {
    "lint:fsd": "steiger ./src"
  }
}
```

### 5.7 FSD 페이지 구조 예시

**1. FSD 페이지 컴포넌트 생성**

`src/pages/home/ui/home-page.tsx`:

```tsx
import { ThemeToggle } from '@/shared/ui';

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1>Boilerplate Next.js</h1>
      <ThemeToggle />
    </div>
  );
}
```

**2. Public API 정의**

`src/pages/home/index.ts`:

```typescript
// FSD Pages Layer - Home Page Public API
export { HomePage } from './ui/home-page';
```

**3. Next.js 라우트에서 re-export**

`app/page.tsx`:

```typescript
// Next.js App Router - re-export from FSD pages layer
export { HomePage as default } from '@/pages/home';
```

---

## Step 6: 다크 모드 구현

### 6.1 next-themes 설치

```bash
pnpm add next-themes react-icons
```

### 6.2 ThemeProvider 컴포넌트 생성

`src/shared/ui/theme-provider.tsx`:

```tsx
'use client';

import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 6.3 ThemeToggle 컴포넌트 생성

`src/shared/ui/theme-toggle.tsx`:

- `useTheme` 훅으로 테마 상태 관리
- `mounted` 상태로 hydration mismatch 방지
- system → light → dark 순환

> 전체 구현: `src/shared/ui/theme-toggle.tsx` 참조

### 6.4 Shared UI Public API

`src/shared/ui/index.ts`:

```typescript
// Shared UI Components - Public API
export { ThemeProvider } from './theme-provider';
export { ThemeToggle } from './theme-toggle';
```

### 6.5 Tailwind CSS v4 다크 모드 설정

`app/globals.css` 핵심 설정:

```css
/* next-themes의 data-theme 속성과 연동 - hydration 이슈 방지 */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

> **Note**: `.dark` 클래스 대신 `data-theme` 속성을 사용하면 hydration 에러를 방지할 수 있습니다.

### 6.6 Layout에 ThemeProvider 적용

`app/layout.tsx` 핵심 설정:

```tsx
<html lang="ko" suppressHydrationWarning>
  <body>
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  </body>
</html>
```

> 전체 구현: `app/layout.tsx` 참조

### 6.7 다크 모드 사용법

```tsx
// dark: prefix로 다크 모드 스타일 적용
<div className="bg-white dark:bg-black text-black dark:text-white">Content</div>
```

---

## Step 7: ShadCN UI 컴포넌트

### 7.1 ShadCN 초기화 (FSD 구조에 맞게)

```bash
pnpm dlx shadcn@latest init
```

초기화 시 선택 옵션:

- Style: **New York**
- Base color: **Neutral**
- CSS variables: **Yes**

### 7.2 components.json FSD 경로 설정

`aliases` 설정으로 ShadCN 컴포넌트가 FSD `shared` 레이어에 설치됨:

```json
"aliases": {
  "components": "@/shared/ui",
  "utils": "@/shared/lib/utils",
  "ui": "@/shared/ui",
  "lib": "@/shared/lib",
  "hooks": "@/shared/hooks"
}
```

> 전체 설정: `components.json` 참조

### 7.3 모든 컴포넌트 설치

```bash
pnpm dlx shadcn@latest add --all
```

### 7.4 설치되는 파일 구조

```
src/shared/
├── ui/                    # ShadCN 컴포넌트들
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── ... (50+ 컴포넌트)
│   ├── theme-provider.tsx  # 커스텀 (기존)
│   └── theme-toggle.tsx    # 커스텀 (기존)
├── lib/
│   └── utils.ts           # cn() 함수
└── hooks/
    └── use-mobile.ts      # 모바일 감지 hook
```

### 7.5 globals.css 업데이트

ShadCN 설치 시 `app/globals.css`가 OKLCH 색상 체계로 자동 업데이트됩니다.

주요 변경:

- `:root` / `[data-theme='dark']`에 ShadCN 테마 변수 (background, foreground, primary, etc.)
- `@theme inline`에 Tailwind 색상 매핑
- `@layer base`에 기본 스타일

> 전체 설정: `app/globals.css` 참조

### 7.6 컴포넌트 사용 예시

```tsx
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function LoginForm() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="m@example.com" />
          </div>
          <Button className="w-full">로그인</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Step 8: SEO 설정

### 8.1 의존성 설치

```bash
pnpm add schema-dts
```

### 8.2 환경 변수 설정

`.env.example`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="your_verification_code"
```

### 8.3 파일 구조

| 파일                        | 설명                   |
| --------------------------- | ---------------------- |
| `app/layout.tsx`            | 전역 Metadata, OG, 등  |
| `app/robots.ts`             | 검색엔진 크롤러 규칙   |
| `app/sitemap.ts`            | 동적 사이트맵 생성     |
| `app/manifest.ts`           | PWA 웹 앱 매니페스트   |
| `src/shared/lib/json-ld.tsx` | JSON-LD 구조화 데이터 |

### 8.4 robots.ts

```typescript
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

### 8.5 sitemap.ts

```typescript
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
```

### 8.6 manifest.ts

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Site Name",
    short_name: "Site",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

### 8.7 JSON-LD 사용법

```tsx
import { JsonLd, createWebSiteJsonLd } from "@/shared/lib";

export default function Page() {
  return (
    <>
      <JsonLd data={createWebSiteJsonLd()} />
      {/* 페이지 컨텐츠 */}
    </>
  );
}
```

---

## 향후 확장 계획

| 기술            | 용도              | 설치 명령어                                                            |
| --------------- | ----------------- | ---------------------------------------------------------------------- |
| **Vitest**      | 테스트 프레임워크 | `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react` |
| **Jotai**       | 전역 상태 관리    | `pnpm add jotai`                                                       |
| **React Query** | 서버 상태 관리    | `pnpm add @tanstack/react-query`                                       |

---

## 참고 자료

### Core

- [Next.js 16 공식 블로그](https://nextjs.org/blog/next-16)
- [Next.js & Tailwind CSS 2025 가이드](https://codeparrot.ai/blogs/nextjs-and-tailwind-css-2025-guide-setup-tips-and-best-practices)

### Styling

- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/blog/tailwindcss-v4/)
- [Tailwind CSS + Next.js 설치 가이드](https://tailwindcss.com/docs/guides/nextjs)
- [ShadCN 공식 문서](https://ui.shadcn.com/)
- [ShadCN Tailwind v4 마이그레이션](https://ui.shadcn.com/docs/tailwind-v4)

### Dark Mode

- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [ShadCN Dark Mode (Next.js)](https://ui.shadcn.com/docs/dark-mode/next)
- [Next.js 15 + ShadCN + Tailwind v4 다크모드 설정 (2025)](https://dev.to/darshan_bajgain/setting-up-2025-nextjs-15-with-shadcn-tailwind-css-v4-no-config-needed-dark-mode-5kl)

### Architecture (FSD)

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD + Next.js 통합 가이드](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- [Steiger GitHub](https://github.com/feature-sliced/steiger)

### Linting & Formatting

- [Biome 공식 문서](https://biomejs.dev/)
- [Biome ESLint/Prettier 마이그레이션](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Lefthook 공식 문서](https://lefthook.dev/)

### Form & Validation

- [react-hook-form 공식 문서](https://react-hook-form.com/)
- [Zod 공식 문서](https://zod.dev/)
