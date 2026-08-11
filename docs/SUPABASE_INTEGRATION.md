# Supabase Auth Integration

이 브랜치는 Supabase SSR 이메일 인증과 `/protected` 경로 보호만 제공합니다.
프로필 테이블, 공개 Storage bucket, 아바타 업로드, 비밀번호 재설정 예제는
포함하지 않습니다.

## 환경 변수

`.env.example`을 `.env.local`로 복사하고 아래 공개 runtime 값을 설정합니다.

```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

Production의 `NEXT_PUBLIC_SITE_URL`은 경로가 없는 공개 HTTP(S) origin이어야
합니다. 앱은 요청의 `Origin` header가 아니라 이 값을 이메일 callback 기준으로
사용합니다.

## 이메일 템플릿

Hosted Supabase Dashboard의 Authentication -> Email Templates에서 링크를 다음
계약으로 설정합니다.

Confirm signup:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

Magic link:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
```

`code` query는 PKCE authorization code 전용입니다. 이메일의 `.Token` 또는
`.TokenHash`를 `code`에 넣지 않습니다. 앱은 `email`과 `magiclink` 이외의 OTP
type을 거부합니다.

Authentication -> URL Configuration에는 배포 origin을 Site URL로, 아래 URL을
Redirect URL로 등록합니다.

```text
https://example.com/auth/confirm
```

## 로컬 확인

Docker 호환 runtime이 실행 중인 상태에서 로컬 stack과 앱을 시작합니다.

```bash
pnpm dlx supabase start
pnpm dlx supabase db reset --local
pnpm dev
```

`supabase start`가 출력한 local API URL과 publishable key를 `.env.local`에
사용합니다. `supabase/config.toml`은 이메일 확인을 켜고, 같은 token hash
계약의 로컬 confirmation/magic-link 템플릿을 사용합니다.

1. `http://localhost:3000/auth/sign-up`에서 가입합니다.
2. Mailpit `http://127.0.0.1:54324`에서 확인 메일을 엽니다.
3. 링크가 `/auth/confirm?token_hash=...&type=email`인지 확인하고 클릭합니다.
4. 같은 origin의 `/`로 돌아오고 로그인 사용자 이메일이 표시되는지 확인합니다.
5. 로그아웃한 뒤 `/protected`가 `/auth/login`으로 redirect되는지 확인합니다.
6. `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`가 익명 요청에도
   redirect되지 않는지 확인합니다.

자동 회귀 검증은 다음 명령으로 실행합니다.

```bash
pnpm test
pnpm typecheck
pnpm lint:fsd
```

## Database migration

현재 앱 전용 migration은 없습니다. 새 schema를 추가할 때만 migration을 만들고
로컬에서 재생합니다.

```bash
pnpm dlx supabase migration new add_app_schema
pnpm dlx supabase db reset --local
```

Remote 적용은 local reset과 다른 작업입니다. 먼저 프로젝트를 연결하고 변경
목록을 검토한 뒤 적용합니다.

```bash
pnpm dlx supabase link --project-ref your-project-ref
pnpm dlx supabase db push --dry-run
pnpm dlx supabase db push
```

`db reset --linked`는 remote 데이터를 지우므로 이 가이드에서 사용하지 않습니다.
이전 템플릿 버전의 profile/avatar migration을 이미 remote에 적용했다면 이
저장소에서 파일을 지운 것만으로 기존 table, trigger, bucket, policy가 삭제되지
않습니다. 해당 프로젝트를 먼저 조사하고 별도 forward cleanup migration을
작성해야 합니다.

## 코드 경계

- Browser/server/proxy client는 `src/shared/api/index.ts`를 통해 사용합니다.
- Server에서는 `getSession()` 대신 검증되는 `getUser()`를 사용합니다.
- Proxy는 `/protected/:path*`에서만 session을 갱신하고, redirect 응답에도 갱신된
  cookie의 값과 옵션을 보존합니다.
- 데이터베이스 기능을 추가하면 generated type을 client에 연결하고, 각 작업에
  필요한 ownership RLS policy를 함께 추가합니다.

공식 참고 자료:

- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SSR with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase local workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
