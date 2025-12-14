# Next.js Boilerplate 구축 보고서

## 개요

이 문서는 Next.js Boilerplate 프로젝트의 구축 과정, 기술 스택 선정 근거, 그리고 아키텍처 설계 결정을 기록합니다.

---

## 1. 구축 순서 (Commit History)

### Phase 1: 프로젝트 초기화

**커밋**: `542a781` - Initial commit from Create Next App

```bash
pnpm dlx create-next-app@latest
```

기본 Next.js 프로젝트 생성 (App Router, TypeScript, Tailwind CSS, ESLint 포함)

---

### Phase 2: 기본 설정 커스터마이징

**커밋**: `27bbedf` - chore: configure Next.js boilerplate defaults

| 변경사항 | 설명 |
|---------|------|
| 한국어 로케일 설정 | `lang="ko"` |
| 페이지 템플릿 간소화 | 불필요한 기본 컨텐츠 제거 |
| TypeScript 엄격 모드 완화 | `strict: false`, `noImplicitAny: false` |
| repomix 설정 추가 | AI 컨텍스트 생성용 |
| favicon 업데이트 | 커스텀 파비콘 적용 |

---

### Phase 3: 린터/포매터 교체

**커밋**: `33159e5` - chore: replace ESLint/Prettier with Biome

| 제거 | 추가 |
|------|------|
| ESLint | Biome |
| eslint-config-next | @biomejs/biome |

**교체 근거**:
- 단일 도구로 린팅 + 포매팅 통합
- ESLint + Prettier 대비 10~100배 빠른 성능
- 설정 파일 단순화 (biome.json 하나로 통합)
- Tailwind CSS v4 지시어 지원

---

### Phase 4: AI 에이전트 및 컨벤션 설정

**커밋**: `1274b35` - chore: add project conventions and AI agent configurations

| 카테고리 | 파일 |
|---------|------|
| Cursor IDE 규칙 | `.cursor/rules/**/*.mdc` |
| GitHub 템플릿 | `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` |
| Git 컨벤션 | `.github/.gitmessage`, `labels.json` |
| MCP 설정 | `.mcp.json`, `.cursor/mcp.json` |
| AI 에이전트 가이드 | `AGENTS.md`, `CLAUDE.md` |
| Node 버전 | `.node-version` |

---

### Phase 5: 다크 모드 구현 (Unstaged)

| 파일 | 역할 |
|------|------|
| `src/shared/ui/theme-provider.tsx` | next-themes ThemeProvider 래퍼 |
| `src/shared/ui/theme-toggle.tsx` | 테마 토글 버튼 컴포넌트 |
| `app/globals.css` | Tailwind CSS v4 다크 모드 설정 |

**구현 방식**:
- `next-themes` 라이브러리 사용
- `data-theme` 속성 기반 (Tailwind v4 `@custom-variant` 활용)
- 시스템 테마 자동 감지 지원

---

### Phase 6: FSD 아키텍처 적용 (Unstaged)

| 변경사항 | 설명 |
|---------|------|
| 디렉토리 구조 재편 | FSD 레이어 구조로 전환 |
| Steiger 설치 | FSD 공식 린터 |
| Path Alias 설정 | 레이어별 import 경로 |

---

## 2. 기술 스택

### Core

| 기술 | 버전 | 선정 근거 |
|------|------|----------|
| **Next.js** | 16.0.10 | React 메타프레임워크, App Router, Server Components |
| **React** | 19.2.1 | 최신 안정 버전, Concurrent Features |
| **TypeScript** | 5.x | 타입 안정성, DX 향상 |

### Styling

| 기술 | 버전 | 선정 근거 |
|------|------|----------|
| **Tailwind CSS** | 4.x | 유틸리티 퍼스트, v4의 새로운 `@theme` 시스템 |
| **next-themes** | 0.4.6 | 다크 모드 구현, SSR hydration 처리 |

### Linting & Formatting

| 기술 | 버전 | 선정 근거 |
|------|------|----------|
| **Biome** | 2.3.8 | ESLint + Prettier 통합 대체, 고성능 |
| **Steiger** | 0.5.11 | FSD 아키텍처 린터, 공식 도구 |

### Git Hooks

| 기술 | 버전 | 선정 근거 |
|------|------|----------|
| **Lefthook** | 2.0.11 | Husky 대비 빠른 성능, Go 기반 |

### 패키지 매니저

| 기술 | 선정 근거 |
|------|----------|
| **pnpm** | 디스크 효율성, 엄격한 의존성 관리, 빠른 설치 |

---

## 3. 아키텍처 (Feature-Sliced Design)

### 디렉토리 구조

```
├── app/                  # Next.js 라우팅 (re-export만)
├── pages/                # 빈 폴더 (Pages Router 방지)
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

### FSD 선정 근거

1. **명확한 의존성 방향**: 상위 → 하위 레이어만 import 가능
2. **격리된 슬라이스**: 같은 레이어 내 cross-import 금지
3. **Public API 강제**: `index.ts`를 통한 캡슐화
4. **확장성**: 프로젝트 규모 증가에도 일관된 구조 유지

### Next.js App Router 통합

```typescript
// app/page.tsx - Next.js 라우트
export { HomePage as default } from "@/pages/home";

// src/pages/home/index.ts - FSD 페이지 Public API
export { HomePage } from "./ui/home-page";
```

---

## 4. 설정 파일 요약

| 파일 | 역할 |
|------|------|
| `biome.json` | 린팅 + 포매팅 설정 |
| `steiger.config.ts` | FSD 아키텍처 린터 설정 |
| `tsconfig.json` | TypeScript + Path Alias |
| `lefthook.yml` | Git hooks 설정 |
| `.github/CONVENTION.md` | 프로젝트 컨벤션 문서 |
| `AGENTS.md` | AI 에이전트 가이드 |

---

## 5. 스크립트

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "biome lint .",
  "lint:fsd": "steiger ./src",
  "format": "biome format --write .",
  "check": "biome check --write ."
}
```

---

## 6. 향후 확장 계획

CONVENTION.md에 정의된 추가 기술 스택:

| 기술 | 용도 |
|------|------|
| **Vitest** | 테스트 프레임워크 |
| **ShadCN** | UI 컴포넌트 라이브러리 |
| **Jotai** | 전역 상태 관리 |
| **React Query** | 서버 상태 관리 |
| **Supabase** | 백엔드 (DB, Auth) |

---

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD + Next.js 통합 가이드](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4/)
- [Biome 공식 문서](https://biomejs.dev/)
- [Steiger GitHub](https://github.com/feature-sliced/steiger)
