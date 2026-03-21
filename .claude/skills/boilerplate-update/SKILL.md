---
name: boilerplate-update
description: Next.js 보일러플레이트 업데이트 및 브랜치 동기화. Use when user says "보일러플레이트 업데이트", "boilerplate update", "nextjs 업데이트", "next 버전 업", "브랜치 동기화", "sync branches", or wants to update the Next.js boilerplate and propagate changes to downstream branches (supabase, neon-cloudflare-r2).
---

# Boilerplate Update

main 브랜치의 Next.js 보일러플레이트를 업데이트하고, 하위 브랜치(supabase, neon-cloudflare-r2)에 변경사항을 전파하는 워크플로우.

## 브랜치 구조

```
main (보일러플레이트 원본)
├── supabase (Supabase Auth/DB 통합)
└── neon-cloudflare-r2 (Neon DB + Cloudflare R2 통합)
```

- 하위 브랜치는 main에서 분기 후 각자의 기능을 추가한 상태
- main 업데이트 시 하위 브랜치에 merge로 반영

## 워크플로우

### Phase 1: main 브랜치 업데이트

1. **Next.js 버전 업그레이드**
   ```bash
   # pnpm의 minimumReleaseAge 정책으로 최신 버전 설치가 실패할 수 있음
   # bun install로 node_modules를 먼저 구성한 뒤 codemod 실행
   bun install
   npx @next/codemod@canary upgrade latest
   ```

2. **빌드 검증**
   ```bash
   # bun.lock, pnpm-lock.yaml은 .gitignore에 포함되어 있으므로 정리 불필요
   # codemod가 pnpm install까지 실행해주므로 바로 빌드 검증
   pnpm build
   ```

4. **세션 중 추가 변경사항 적용** (해당 시에만)
   - 스킬 추가/수정
   - 설정 파일 업데이트
   - AGENTS.md 갱신

5. **커밋 및 푸시**
   ```bash
   git add <changed-files>
   git commit -m "chore: update Next.js to <version>"
   git push origin main
   ```

### Phase 2: 하위 브랜치 동기화

각 하위 브랜치에 main의 변경사항을 merge:

```bash
# supabase 브랜치
git checkout supabase
git merge main
# 충돌 해결 후
pnpm install
pnpm build
git push origin supabase

# neon-cloudflare-r2 브랜치
git checkout neon-cloudflare-r2
git merge main
# 충돌 해결 후
pnpm install
pnpm build
git push origin neon-cloudflare-r2

# main으로 복귀
git checkout main
```

## 충돌 해결 가이드

- `package.json`: 하위 브랜치의 추가 의존성을 유지하면서 버전 업데이트 반영
- `pnpm-lock.yaml`: .gitignore에 포함되어 있으므로 충돌 없음. 문제 시 삭제 후 `pnpm install`로 재생성
- `.claude/skills/`, `AGENTS.md`: 양쪽 변경사항 모두 유지 (additive merge)

## 주의사항

- pnpm의 `minimumReleaseAge` 정책으로 방금 publish된 패키지 설치가 거부될 수 있음. 이 경우 `bun install`로 우회하거나 `.npmrc`에 `minimum-release-age-exclude` 설정 추가
- `@next/codemod`는 `node_modules/next`를 직접 참조하므로, pnpm의 strict 구조에서는 `bun install`로 flat node_modules를 먼저 만들어야 동작함
- 하위 브랜치 merge 시 반드시 `pnpm build`로 빌드 검증
