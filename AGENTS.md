# Next.js Boilerplate

## Tech Stack

- Next.js 16.0.10
- React 19.2.1
- Tailwind CSS 4
- Biome (linter/formatter)
- TypeScript 5

## Features

### Dark Mode

- `next-themes` 라이브러리 사용
- Tailwind CSS v4의 `@custom-variant`와 `data-theme` 속성 활용
- 시스템 테마 자동 감지 지원
- light/dark/system 3가지 테마 지원

#### 관련 파일

- `src/components/theme-provider.tsx`: ThemeProvider 클라이언트 컴포넌트
- `src/components/theme-toggle.tsx`: 테마 토글 버튼 컴포넌트
- `src/app/globals.css`: Tailwind CSS v4 다크 모드 설정
- `src/app/layout.tsx`: ThemeProvider 적용

#### 사용법

```tsx
// dark: prefix로 다크 모드 스타일 적용
<div className="bg-white dark:bg-black text-black dark:text-white">
  Content
</div>
```

## Architecture (FSD)

이 프로젝트는 [Feature-Sliced Design](https://feature-sliced.design/)을 따릅니다.

### 레이어 구조

```
src/
├── app/        # FSD App Layer - 프로바이더, 전역 설정
├── pages/      # FSD Pages Layer - 페이지 컴포넌트 조합
├── widgets/    # 독립적인 UI 블록 (Header, Footer...)
├── features/   # 사용자 기능 (auth, checkout...)
├── entities/   # 비즈니스 엔티티 (user, product...)
└── shared/     # 공유 리소스 (ui, lib, api...)
```

### Import 규칙

- **의존성 방향**: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- **같은 레이어 내 cross-import 금지**
- **index.ts를 통해서만 외부 노출**

### FSD 린터

```bash
pnpm lint:fsd  # Steiger로 FSD 구조 검사
```

### 코드 작성 시 체크리스트

1. 새 기능 추가 시 올바른 레이어에 배치
2. `index.ts`로 Public API 정의
3. 상위 → 하위 레이어 방향으로만 import
4. `.github/CONVENTION.md` 참조
