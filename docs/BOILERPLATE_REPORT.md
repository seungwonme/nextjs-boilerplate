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
9. [향후 확장 계획](#향후-확장-계획)

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

`biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80,
    "bracketSpacing": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error",
        "useJsxKeyInIterable": "error"
      },
      "suspicious": {
        "noExplicitAny": "off"
      },
      "a11y": {
        "useAltText": "warn",
        "useValidAriaProps": "warn",
        "useValidAriaValues": "warn"
      },
      "performance": {
        "noImgElement": "warn"
      },
      "style": {
        "noHeadElement": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "jsxQuoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSameLine": false
    }
  },
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    },
    "linter": {
      "enabled": true
    }
  },
  "overrides": [
    {
      "includes": ["*.json"],
      "formatter": {
        "lineWidth": 200
      }
    },
    {
      "includes": ["src/shared/ui/**"],
      "linter": {
        "rules": {
          "a11y": {
            "useSemanticElements": "off",
            "useFocusableInteractive": "off",
            "useKeyWithClickEvents": "off",
            "useAriaPropsForRole": "off",
            "noRedundantRoles": "off"
          },
          "suspicious": {
            "noDocumentCookie": "off",
            "noArrayIndexKey": "off",
            "noDoubleEquals": "off"
          },
          "security": {
            "noDangerouslySetInnerHtml": "off"
          },
          "correctness": {
            "useExhaustiveDependencies": "off"
          }
        }
      }
    }
  ],
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

> **Note**: `src/shared/ui/**`에 대한 override 설정은 ShadCN UI 컴포넌트에서 발생하는 린트 오류를 방지합니다. ShadCN은 공식적으로 `role="group"`, `document.cookie`, `dangerouslySetInnerHTML` 등의 패턴을 사용하므로, 해당 폴더에 대해서만 관련 규칙을 비활성화합니다. 직접 작성하는 코드에는 여전히 엄격한 규칙이 적용됩니다.

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

`lefthook.yml`:

```yaml
# https://lefthook.dev/
# lefthook install

pre-commit:
  parallel: true
  commands:
    biome-check:
      glob: '*.{js,jsx,ts,tsx,json,jsonc}'
      run: pnpm biome check --write --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
      stage_fixed: true

    typecheck:
      glob: '*.{ts,tsx}'
      run: pnpm tsc --noEmit
      stage_fixed: false

    # .env 파일 커밋 방지
    prevent-env:
      glob: '.env*'
      exclude: '.env.example'
      run: |
        echo -e "\033[31mERROR: .env 파일은 커밋할 수 없습니다. .env.example 파일을 사용하세요.\033[0m"
        exit 1

    # 후행 공백 제거
    trailing-whitespace:
      glob: '*.{js,jsx,ts,tsx,json,jsonc,md,yml,yaml}'
      run: |
        for file in {staged_files}; do
          sed -i '' 's/[[:space:]]*$//' "$file"
        done
      stage_fixed: true

    # 병합 충돌 검사
    check-merge-conflict:
      run: |
        if git diff --cached --name-only | xargs grep -l -E "^(<<<<<<<|=======|>>>>>>>)" 2>/dev/null; then
          echo -e "\033[31mERROR: 병합 충돌 마커가 포함된 파일이 있습니다.\033[0m"
          exit 1
        fi

    # 민감한 개인키 검출
    detect-private-key:
      run: |
        PRIVATE_KEY_PATTERN="-----BEGIN (RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----"
        if git diff --cached --name-only | xargs grep -l -E "$PRIVATE_KEY_PATTERN" 2>/dev/null; then
          echo -e "\033[31mERROR: 민감한 개인키가 포함된 파일이 있습니다.\033[0m"
          exit 1
        fi
```

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

```tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration mismatch 방지
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-foreground/10"
        aria-label="Toggle theme"
      >
        <span className="size-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-foreground/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' && <LuSun className="size-5" />}
      {theme === 'dark' && <LuMoon className="size-5" />}
      {theme === 'system' && <LuMonitor className="size-5" />}
    </button>
  );
}
```

### 6.4 Shared UI Public API

`src/shared/ui/index.ts`:

```typescript
// Shared UI Components - Public API
export { ThemeProvider } from './theme-provider';
export { ThemeToggle } from './theme-toggle';
```

### 6.5 Tailwind CSS v4 다크 모드 설정

`app/globals.css` (기본 설정):

```css
@import 'tailwindcss';

/* next-themes의 data-theme 속성과 연동 - hydration 이슈 방지 */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --background: #ffffff;
  --foreground: #171717;
}

[data-theme='dark'] {
  --background: #0a0a0a;
  --foreground: #ededed;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

> **Note**: `attribute="data-theme"` 사용 시 CSS 변수도 `[data-theme="dark"]` 선택자로 정의해야 합니다. `.dark` 클래스 대신 `data-theme` 속성을 사용하면 hydration 에러를 방지할 수 있습니다. ShadCN 설치 후 globals.css는 OKLCH 색상 체계로 업데이트됩니다 (Step 7.6 참조).

### 6.6 Layout에 ThemeProvider 적용

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/shared/ui';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
  );
}
```

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

`components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  }
}
```

> **핵심**: `aliases` 설정으로 ShadCN 컴포넌트가 FSD `shared` 레이어에 설치됨

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

### 7.5 globals.css 업데이트 (ShadCN 테마 변수)

`app/globals.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-popover: var(--popover);
  /* Sidebar, Chart 변수들 */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  /* ... */
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... 전체 컬러 팔레트 */
}

/* next-themes attribute="data-theme" 사용 시 hydration 이슈 방지 */
[data-theme='dark'] {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... 다크 모드 컬러 */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 7.6 설치되는 주요 의존성

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.x",
    "@radix-ui/react-alert-dialog": "^1.1.x",
    "@radix-ui/react-dialog": "^1.1.x",
    "@radix-ui/react-dropdown-menu": "^2.1.x",
    "@radix-ui/react-popover": "^1.1.x",
    "@radix-ui/react-select": "^2.2.x",
    "@radix-ui/react-tabs": "^1.1.x",
    "@radix-ui/react-tooltip": "^1.2.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.1.x",
    "cmdk": "^1.1.x",
    "date-fns": "^4.1.x",
    "embla-carousel-react": "^8.6.x",
    "input-otp": "^1.4.x",
    "lucide-react": "^0.561.x",
    "react-day-picker": "^9.12.x",
    "react-hook-form": "^7.68.x",
    "react-resizable-panels": "^3.0.x",
    "recharts": "^2.15.x",
    "sonner": "^2.0.x",
    "tailwind-merge": "^3.4.x",
    "vaul": "^1.1.x",
    "zod": "^4.1.x",
    "@hookform/resolvers": "^5.2.x"
  },
  "devDependencies": {
    "tw-animate-css": "^1.4.x"
  }
}
```

### 7.7 컴포넌트 사용 예시

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
