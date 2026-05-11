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

1. **사전 점검**
   - 현재 브랜치가 `main`인지 확인 (`git status`)
   - 워킹 트리가 깨끗한지 확인 (필요 시 stash)

2. **Next.js 버전 업그레이드**

   ```bash
   # @next/codemod는 node_modules/next 를 직접 참조하므로 먼저 설치 필수
   # 비어있으면 "Failed to get the installed Next.js version" 에러로 종료됨
   pnpm install

   # revision은 위치 인자 (옵션 아님). --latest 같은 플래그 없음
   #   - latest / canary / rc       : npm dist-tag
   #   - patch / minor / major      : 범위 (기본값 minor)
   #   - 16.3.0 처럼 정확한 버전 지정 가능
   npx @next/codemod@canary upgrade latest
   ```

   codemod가 자동으로 처리해주는 것:
   - `package.json` 의 `next`, `react`, `react-dom` 버전 갱신
   - `pnpm install` 재실행 (lockfile 갱신)
   - 필요한 경우 `.node-version` 갱신 (Node 요구 버전이 올라간 경우)
   - 코드 자동 변환 codemod 적용

   참고:
   - 실행 중 `npm warn Unknown project config "minimum-release-age-exclude"` 경고는 npx(=npm) 가 pnpm 전용 설정을 못 알아봐서 뜨는 경고. 무시 가능.
   - 종료 직전 뜨는 `(node:xxxx) [DEP0190] DeprecationWarning` 도 codemod 내부 child_process 호출에서 나오는 것이라 우리 쪽에서 손댈 필요 없음.

3. **빌드 검증**

   ```bash
   pnpm build
   ```

4. **세션 중 추가 변경사항 적용** (해당 시에만)
   - 스킬 추가/수정
   - 설정 파일 업데이트
   - AGENTS.md 갱신

5. **커밋 및 푸시**

   일반적으로 갱신되는 파일: `package.json`, `pnpm-lock.yaml`, `.node-version`

   ```bash
   git add package.json pnpm-lock.yaml .node-version
   git commit -m "chore: upgrade Next.js to <version>"
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
- `pnpm-lock.yaml`: 트래킹되는 파일이므로 충돌 시 삭제 후 `pnpm install` 로 재생성
- `.claude/skills/`, `AGENTS.md`: 양쪽 변경사항 모두 유지 (additive merge)

## 주의사항 / 트러블슈팅

- **`Failed to get the installed Next.js version`**: `node_modules/next` 가 없으면 codemod 가 현재 버전을 못 읽어 종료. `pnpm install` 부터 다시 실행.
- **`error: unknown option '--latest'`**: `--latest` 같은 플래그는 없음. 위치 인자(`upgrade latest`)로 전달.
- **`pnpm` minimumReleaseAge 로 최신 패키지 설치 거부**: 루트 `.npmrc` 의 `minimum-release-age-exclude` 항목에 차단된 패키지 이름을 추가. 현재는 `next`, `@next/env`, `@next/swc-*` 가 등록돼 있음.
- **codemod 가 끝까지 안 가고 중단**: `node_modules` 와 `pnpm-lock.yaml` 을 지우고 `pnpm install` 로 깨끗하게 재구성한 뒤 다시 시도.
- 하위 브랜치 merge 시 반드시 `pnpm build` 로 빌드 검증.
