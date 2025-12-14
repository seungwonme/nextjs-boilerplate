# Conventions

- [Git Convention](#git-convention)
  - [Branch Type Description](#branch-type-description)
  - [Commit Message Convention](#commit-message-convention)
  - [Issue Label Setting](#issue-label-setting)
- [Code Style Convention](#code-style-convention)
  - [prettier](#prettier)
  - [eslint](#eslint)
  - [tsconfig](#tsconfig)
  - [pre-commit](#pre-commit)
- [Comment Convention](#comment-convention)
- [NextJS Convention](#nextjs-convention)
  - [Package Manager](#package-manager)
  - [File Name Convention](#file-name-convention)
  - [Function/Variable Convention](#functionvariable-convention)
  - [Component Convention](#component-convention)
  - [Directory Convention (Feature-Sliced Design)](#directory-convention-feature-sliced-design)
    - [프로젝트 구조](#프로젝트-구조)
    - [FSD 레이어 규칙](#fsd-레이어-규칙)
    - [Next.js App Router와 FSD 통합](#nextjs-app-router와-fsd-통합)
    - [Server Actions 배치](#server-actions-배치)
    - [FSD 아키텍처 린터 (Steiger)](#fsd-아키텍처-린터-steiger)
    - [FSD 슬라이스 생성 템플릿](#fsd-슬라이스-생성-템플릿)
    - [FSD 체크리스트](#fsd-체크리스트)
- [Package Convention](#package-convention)
  - [Vitest](#vitest)
  - [TailwindCSS](#tailwindcss)
  - [ShadCN Component](#shadcn-component)
  - [lucide-react](#lucide-react)
  - [Jotai](#jotai)
  - [React Query](#react-query)
  - [Supabase](#supabase)
- [Cursor Convention](#cursor-convention)
  - [Code Writing](#code-writing)
  - [File Context](#file-context)
  - [Reference](#reference)

## Git Convention

- 깃 브랜치 전략은 [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)를 따르며 이를 기반으로 한 브랜치 네이밍 컨벤션을 사용합니다.
- 브랜치 네이밍 형식: `type/[branch/]description[-#issue]`
  - [] 안의 내용은 선택 사항입니다.
  - `type`: 브랜치 타입
  - `branch`: 분기한 브랜치명 (e.g. `dev`, `main`)
  - `description`: 브랜치 설명
  - `issue`: 관련된 이슈 번호

### Branch Type Description

- **feat** (feature)
  새로운 기능을 추가할 때 사용합니다.
  예: `feat/login-#123`
- **fix** (bug fix)
  버그를 수정할 때 사용합니다.
  예: `fix/button-click-#456`
- **docs** (documentation)
  문서 작업(README, 주석 등)을 할 때 사용합니다.
  예: `docs/api-docs-#789`
- **style** (formatting, missing semi colons, …)
  코드 스타일(포맷 수정, 세미콜론 추가 등)을 수정할 때 사용합니다. 기능 수정은 포함되지 않습니다.
  예: `style/css-format-#101`
- **refactor**
  코드 리팩토링(기능 변경 없이 코드 구조 개선)을 할 때 사용합니다.
  예: `refactor/auth-service-#102`
- **test** (when adding missing tests)
  테스트 코드를 추가하거나 수정할 때 사용합니다.
  예: `test/unit-tests-#103`
- **chore** (maintain)
  프로젝트 유지 보수 작업(빌드 설정, 패키지 업데이트 등)을 할 때 사용합니다.
  예: `chore/dependency-update-#104`

### Commit Message Convention

`git config --local commit.template .github/.gitmessage` 명령어를 통해 커밋 메시지 템플릿을 설정할 수 있습니다.
컨벤션 내용은 [AngularJS Git Commit Message Conventions](https://gist.github.com/stephenparish/9941e89d80e2bc58a153)와 [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)을 기반으로 작성되어 있으며 `.gitmessage` 파일에 작성되어 있습니다.

### Issue Label Setting

`github-label-sync --access-token <access_token> --labels .github/labels.json <owner>/<repo>`

## Code Style Convention

- [Prettier](https://prettier.io/)와 [ESLint](https://eslint.org/)를 사용하여 코드 스타일을 관리합니다.

### [prettier](https://prettier.io/docs/options)

```json
{
  "printWidth": 80, // 한 줄의 최대 길이
  "tabWidth": 2, // 들여쓰기에 사용할 공백 수
  "useTabs": false, // 탭 대신 공백 사용
  "singleQuote": false, // 문자열에 쌍따옴표 사용
  "semi": true, // 문장 끝에 세미콜론 사용
  "endOfLine": "lf", // 줄바꿈

  "proseWrap": "preserve", // 마크다운 텍스트 안 건드리기
  "bracketSpacing": true, // 객체 리터럴에서 괄호에 공백 삽입
  "arrowParens": "always", // 화살표 함수 인자에 괄호 사용
  "htmlWhitespaceSensitivity": "css", // HTML 파일의 공백 처리 방식
  "jsxSingleQuote": false, // JSX에서 쌍따옴표 사용
  "jsxBracketSameLine": false, // 여는 태그의 `>`를 다음 줄로 내림
  "quoteProps": "as-needed", // 객체 속성 이름에 따옴표가 필요한 경우에만 따옴표 사용
  "trailingComma": "all", // 마지막 요소 뒤에 쉼표 사용
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 200
      }
    }
  ]
}
```

### eslint

`// eslint-disable-next-line` 주석은 정말 필요한 경우에만 사용하며, 가능한 한 ESLint 규칙을 준수하는 방향으로 코드를 수정하는 것을 우선시합니다.

```mjs
// .eslintrc.mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
```

### tsconfig

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noImplicitAny": false, // any 타입 허용
    "skipLibCheck": true,
    "strict": false, // 엄격한 타입 검사 비활성화
    "forceConsistentCasingInFileNames": false, // 파일 이름의 대소문자 일관성 비활성화
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### pre-commit

```shell
pnpm install --save-dev husky prettier eslint lint-staged eslint-config-prettier eslint-plugin-react-hooks

pnpm dlx husky-init
pnpm pkg set scripts.prepare="husky install"
pnpm run prepare
chmod +x .husky/*
```

`package.json`에 추가

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

`.husky/pre-commit` 수정

```shell
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

## Comment Convention

- [Todo Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight) Extension 설치
- Commend Palette -> `Preferences: Open User Settings (JSON)` -> 아래 코드 추가
  - TODO: 해야 할 작업 표시 (미구현 기능, 추가 개발 필요 사항)
  - NOTE: 중요한 설명이나 주의사항 기록
  - FIXME: 수정이 필요한 버그나 문제점 표시
  - TEST: 테스트가 필요한 부분이나 테스트 케이스 기록

```json
{
  "todohighlight.include": [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
    "**/*.html",
    "**/*.php",
    "**/*.css",
    "**/*.scss",
    "**/*.py",
    "*/*"
  ],
  "todohighlight.exclude": [
    "**/node_modules/**",
    "**/bower_components/**",
    "**/dist/**",
    "**/build/**",
    "**/.vscode/**",
    "**/.github/**",
    "**/_output/**",
    "**/*.min.*",
    "**/*.map",
    "**/.next/**"
  ],
  "todohighlight.maxFilesForSearch": 5120,
  "todohighlight.toggleURI": false,
  "todohighlight.isEnable": true,
  "todohighlight.isCaseSensitive": true,
  "todohighlight.defaultStyle": {
    "color": "red",
    "backgroundColor": "#2B2B2B",
    "overviewRulerColor": "#ffab00",
    "cursor": "pointer",
    "border": "1px solid #eee",
    "borderRadius": "2px",
    "isWholeLine": true
  },
  "todohighlight.keywords": [
    // Common
    {
      "text": "TODO:",
      "color": "#DFB6FF",
      "backgroundColor": "#2B2B2B",
      "overviewRulerColor": "#DFB6FF"
    },
    {
      "text": "NOTE:",
      "color": "#98ECAB",
      "backgroundColor": "#2B2B2B",
      "overviewRulerColor": "#98ECAB"
    },
    {
      "text": "FIXME:",
      "color": "#FFB3B3",
      "backgroundColor": "#2B2B2B",
      "overviewRulerColor": "#FFB3B3"
    },
    {
      "text": "TEST:",
      "color": "#C8B9FF",
      "backgroundColor": "#2B2B2B",
      "overviewRulerColor": "#C8B9FF"
    },
    {
      "text": "eslint-disable-next-line",
      "color": "#4630BD",
      "backgroundColor": "#2B2B2B",
      "overviewRulerColor": "#407FBF"
    }
  ]
}
```

## NextJS Convention

### Package Manager

[pnpm](https://pnpm.io/)을 사용합니다.

### File Name Convention

- 모든 파일 이름은 `kebab-case` 로 작성합니다.
- `not-found.tsx`, `mdx-components.tsx` 처럼, 최대한 간결하게 하되, 단어 사이는 [하이픈으로 연결](https://nextjs.org/docs/app/api-reference/file-conventions)합니다.

### Function/Variable Convention

- `camelCase` 로 작성합니다.
- TypeScript 타입은 반드시 정의해야 합니다.

### Component Convention

- Component 명은 `PascalCase` 로 작성합니다. (Component 파일명도 예외없이 `kebab-case`로 작성합니다)
- Component는 재사용 가능하도록 설계해야 합니다.

### Directory Convention (Feature-Sliced Design)

[Feature-Sliced Design (FSD)](https://feature-sliced.design/)을 Next.js App Router와 통합하여 사용합니다.

- [FSD 공식 문서 - Next.js 통합](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- [Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)

#### 프로젝트 구조

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

#### FSD 레이어 규칙

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

#### Next.js App Router와 FSD 통합

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

#### Server Actions 배치

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

#### FSD 아키텍처 린터 (Steiger)

FSD 레이어 간 의존성을 강제하기 위해 [Steiger](https://github.com/feature-sliced/steiger) (FSD 공식 린터)를 사용합니다.

##### 설치

```bash
pnpm install -D steiger @feature-sliced/steiger-plugin
```

##### 설정 파일

```typescript
// steiger.config.ts
import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next.js 라우팅 디렉토리는 제외
    ignores: ["app/**", "pages/**"],
  },
]);
```

##### 실행

```bash
pnpm lint:fsd  # steiger ./src
```

##### 주요 규칙

- `fsd/forbidden-imports` - 상위 레이어 import 및 같은 레이어 cross-import 금지
- `fsd/no-public-api-sidestep` - index.ts를 우회한 내부 모듈 직접 import 금지
- `fsd/ambiguous-slice-names` - 슬라이스 이름이 세그먼트 이름과 충돌하는 경우 감지
- `fsd/excessive-slicing` - 과도한 슬라이스 분할 경고

##### Cross-Import 금지

같은 레이어 내 슬라이스 간 직접 import는 금지됩니다:

```typescript
// ❌ 잘못된 예: features/auth에서 features/payment 직접 import
// src/features/auth/ui/login-form.tsx
import { PaymentButton } from '@/features/payment';

// ✅ 올바른 예: 상위 레이어(pages/widgets)에서 조합
// src/pages/checkout/ui/checkout-page.tsx
import { LoginForm } from '@/features/auth';
import { PaymentButton } from '@/features/payment';
```

##### TypeScript Path Alias 설정

```json
// tsconfig.json
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

#### FSD 슬라이스 생성 템플릿

새 슬라이스를 생성할 때 다음 구조를 따릅니다:

```bash
# Feature 슬라이스 생성 예시
mkdir -p src/features/auth/{ui,model,api,lib}
touch src/features/auth/index.ts

# Entity 슬라이스 생성 예시
mkdir -p src/entities/user/{ui,model,api}
touch src/entities/user/index.ts

# Widget 슬라이스 생성 예시
mkdir -p src/widgets/header/{ui,model}
touch src/widgets/header/index.ts
```

##### index.ts (Public API) 템플릿

```typescript
// src/features/auth/index.ts
// Public API - 외부에서 접근 가능한 것들만 export

// UI Components
export { LoginForm } from './ui/login-form';
export { SignupForm } from './ui/signup-form';

// Model (hooks, stores, types)
export { useAuth } from './model/use-auth';
export type { AuthUser, AuthState } from './model/types';

// API (if needed externally)
export { signIn, signOut } from './api/actions';
```

#### FSD 체크리스트

새로운 코드 작성 시 확인사항:

- [ ] 올바른 레이어에 코드를 배치했는가?
- [ ] `index.ts`를 통해서만 외부에 노출하고 있는가?
- [ ] 상위 레이어에서 하위 레이어만 import하고 있는가?
- [ ] 같은 레이어의 다른 슬라이스를 직접 import하지 않았는가?
- [ ] 슬라이스 내부 구조(ui/, model/, api/, lib/)를 올바르게 사용했는가?

## Package Convention

- [2025년을 위한 필수 React 라이브러리들](https://news.hada.io/topic?id=19556)
- [React Libraries for 2025](https://www.robinwieruch.de/react-libraries/)

### Vitest

[How to set up Vitest with Next.js](https://nextjs.org/docs/pages/guides/testing/vitest)

```sh
pnpm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

`vitest.config.mts`

```ts
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

`package.json`

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

테스트 예시: `__tests__/page.test.tsx`

```tsx
import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

test('Page', () => {
  render(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined();
});
```

### TailwindCSS

- 모든 스타일은 TailwindCSS를 사용해야 합니다.
- [TailwindCSS v4](https://tailwindcss.com/blog/tailwindcss-v4/) 버전을 사용합니다.
  - 그러므로 `tailwind.config.js`, `tailwind.config.ts` 파일은 사용하지 않고 `globals.css` 파일만을 사용합니다.

### ShadCN Component

- 모든 UI 컴포넌트는 ShadCN을 사용해야 합니다.
- 컴포넌트 사용 전 설치 여부를 확인해야 합니다: `src/shared/ui` 디렉토리 체크
- 컴포넌트 설치 명령어를 사용해야 합니다: `pnpm dlx shadcn@latest add [component-name]`
- `components.json` 설정에서 경로를 FSD 구조에 맞게 설정:

  ```json
  {
    "aliases": {
      "components": "@/shared/ui",
      "utils": "@/shared/lib/utils"
    }
  }
  ```

### lucide-react

- 모든 아이콘은 lucide-react를 사용해야 합니다.
- 아이콘 임포트 방법: `import { IconName } from 'lucide-react';`
- 예시: `import { Menu, X } from 'lucide-react';`

### Jotai

- 전역 상태관리는 Jotai를 사용해야 합니다.

### React Query

- 데이터 패칭은 React Query를 사용해야 합니다.

### Supabase

- 데이터베이스는 Supabase를 사용해야 하며 `@supabase/supabase-js`를 사용해야 합니다.
- 사용자 인증은 Supabase Auth를 사용해야 하며 `@supabase/ssr`를 사용해야 합니다.
- 클라이언트 파일은 `src/shared/api/supabase/` 폴더에 넣어야 합니다. ([참고](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs))

  ```
  src/shared/api/supabase/
  ├── client.ts      # 브라우저용 Supabase 클라이언트
  ├── server.ts      # 서버용 Supabase 클라이언트
  └── middleware.ts  # Middleware용 클라이언트 (필요시)
  ```

## Cursor Convention

### Code Writing

1. 각 코드 파일의 길이를 500줄 이하로 유지하세요.

> Cursor는 기본적으로 파일의 처음 250줄을 읽고, 필요 시 추가로 250줄을 더 읽습니다. 따라서 파일 길이를 500줄 이하로 유지하면 전체 파일을 읽을 수 있어 코드 이해와 처리가 원활해집니다.

2. 각 코드 파일의 첫 100줄에 해당 파일의 기능과 구현 로직을 명확히 문서화하세요.

> Cursor는 파일 검색 시 최대 100줄의 코드를 읽습니다. 파일의 초반부에 주석을 통해 해당 파일의 목적과 주요 로직을 설명하면, Cursor 에이전트가 파일의 역할을 빠르게 파악하여 적절한 처리를 수행할 수 있습니다.

```tsx
/**
 * @file user-profile-page.tsx
 * @description 사용자 프로필 페이지 컴포넌트
 * @layer pages
 * @slice user-profile
 *
 * 이 컴포넌트는 사용자의 프로필 정보를 표시하고 수정하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 사용자 기본 정보 표시 (이름, 이메일, 프로필 이미지)
 * 2. 프로필 정보 수정
 * 3. 프로필 이미지 업로드
 *
 * 구현 로직:
 * - Supabase Auth를 통한 사용자 인증 상태 확인
 * - React Query를 사용한 프로필 데이터 fetching
 * - 이미지 업로드를 위한 Supabase Storage 활용
 * - Form 상태 관리를 위한 React Hook Form 사용
 *
 * @dependencies
 * - @supabase/ssr
 * - @tanstack/react-query
 * - react-hook-form
 * - lucide-react
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProfileForm } from '@/features/profile';
import { UserCard } from '@/entities/user';
import { createClient } from '@/shared/api/supabase/client';
import { Button } from '@/shared/ui';
import { User } from 'lucide-react';

// ... 컴포넌트 구현 ...
```

3. 프로젝트의 상태와 구조를 `README.md`와 같은 전용 파일에 정기적으로 문서화하세요.

> 프로젝트의 전반적인 상태와 구조를 문서화하면 Cursor가 프로젝트를 빠르게 이해하고, 대화 재시작 시 불필요한 컨텍스트를 최소화할 수 있습니다.

### File Context

1. 프로젝트 구조를 이해하고 특정 파일을 대상으로 작업할 때는 Cursor의 `@` 기능을 활용하세요.

> Cursor에서 `@`를 사용하여 특정 파일을 지정하면 해당 파일을 최대한 완전히 읽으려 시도합니다. (최대 2000줄) 이를 통해 필요한 코드 컨텍스트를 확보하여 작업의 정확성을 높일 수 있습니다.

2. `@[파일/폴더]` 태그를 적극적으로 활용하세요.

> Cursor의 `@[파일/폴더]` 태그를 사용하여 특정 파일이나 폴더를 지정하면, 해당 파일들의 전체 내용(최대 2000자)을 언어 모델에 전달할 수 있습니다. 이를 통해 모델이 필요한 컨텍스트를 충분히 확보하여 더 정확한 코드를 생성하거나 수정할 수 있습니다.

3. 새로운 기능을 추가하거나 버그를 수정한 후에는 대화를 재시작하세요.

> 작업 후 대화를 재시작하면 긴 컨텍스트로 인한 혼란을 방지하고, 프로젝트의 최신 상태를 반영한 새로운 컨텍스트로 작업을 이어갈 수 있습니다.

### Reference

- [Understanding Cursor and WindSurf's Code Indexing Logic](https://www.pixelstech.net/article/1734832711-understanding-cursor-and-windsurf-s-code-indexing-logic)
- [How Cursor (AI IDE) Works](https://blog.sshh.io/p/how-cursor-ai-ide-works)
