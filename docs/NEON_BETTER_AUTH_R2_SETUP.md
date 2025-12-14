# Neon DB + Better Auth + Cloudflare R2 통합 가이드

## 개요

이 문서는 Next.js 16 보일러플레이트에 다음 기술 스택을 통합하는 방법을 설명합니다:

- **Neon DB**: Serverless PostgreSQL 데이터베이스
- **Better Auth**: TypeScript 기반 인증 라이브러리
- **Cloudflare R2**: S3 호환 오브젝트 스토리지

## 설치된 패키지

```bash
# Neon DB + Drizzle ORM
pnpm add @neondatabase/serverless drizzle-orm
pnpm add -D drizzle-kit dotenv

# Better Auth
pnpm add better-auth

# Better Auth UI (shadcn/ui 기반)
pnpm add @daveyplate/better-auth-ui

# Cloudflare R2 (AWS SDK v3)
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정하세요:

```bash
# Neon Database
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Better Auth (32자 이상 필수)
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-bucket.your-domain.com"
```

### BETTER_AUTH_SECRET 생성

```bash
openssl rand -base64 32
```

## 파일 구조

```
src/
├── shared/
│   ├── api/
│   │   ├── db.ts              # Drizzle + Neon 클라이언트
│   │   └── storage.ts         # R2 클라이언트
│   └── lib/
│       ├── auth.ts            # Better Auth 서버 설정
│       └── auth-client.ts     # Better Auth 클라이언트
│
├── features/
│   └── auth/
│       ├── ui/
│       │   └── auth-provider.tsx
│       └── index.ts
│
├── entities/
│   └── user/
│       ├── model/
│       │   └── schema.ts      # Drizzle 스키마
│       └── index.ts
│
└── app/
    └── providers.tsx          # AuthUIProvider 래퍼

app/
├── api/
│   ├── auth/[...all]/
│   │   └── route.ts           # Better Auth API
│   └── upload/
│       └── route.ts           # R2 Presigned URL API
├── (auth)/
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
└── layout.tsx                 # Providers 적용

middleware.ts                  # 인증 미들웨어
drizzle.config.ts              # Drizzle Kit 설정
```

## 주요 파일 설명

### 1. 데이터베이스 (Neon + Drizzle)

**`src/shared/api/db.ts`**

Neon Serverless 드라이버와 Drizzle ORM을 사용한 데이터베이스 클라이언트입니다.

**`src/entities/user/model/schema.ts`**

Better Auth에서 사용하는 테이블 스키마:
- `users`: 사용자 정보
- `sessions`: 세션 정보
- `accounts`: OAuth 계정 연동
- `verifications`: 이메일 인증 등

### 2. 인증 (Better Auth)

**`src/shared/lib/auth.ts`**

서버 측 Better Auth 설정:
- Drizzle 어댑터 사용
- Email/Password 인증
- Google, GitHub OAuth

**`src/shared/lib/auth-client.ts`**

클라이언트 측 Better Auth 훅 및 함수:
- `useSession`: 세션 상태 조회
- `signIn`, `signOut`, `signUp`: 인증 액션

**`app/api/auth/[...all]/route.ts`**

Better Auth API 엔드포인트입니다.

### 3. 파일 스토리지 (Cloudflare R2)

**`src/shared/api/storage.ts`**

R2 스토리지 클라이언트:
- `getUploadPresignedUrl`: 업로드용 Presigned URL 생성
- `getDownloadPresignedUrl`: 다운로드용 Presigned URL 생성
- `deleteObject`: 파일 삭제

**`app/api/upload/route.ts`**

인증된 사용자만 파일 업로드 가능한 API입니다.

### 4. 미들웨어

**`middleware.ts`**

라우트 보호 미들웨어:
- 보호된 경로: `/dashboard`, `/profile`, `/settings`
- 인증 경로: `/sign-in`, `/sign-up`

## 데이터베이스 마이그레이션

```bash
# 마이그레이션 파일 생성
pnpm drizzle-kit generate

# 마이그레이션 적용
pnpm drizzle-kit migrate
```

## 사용 예시

### 세션 확인 (클라이언트)

```tsx
"use client";

import { useSession } from "@/shared/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello, {session.user.name}</div>;
}
```

### 파일 업로드 (클라이언트)

```tsx
async function uploadFile(file: File) {
  // 1. Presigned URL 요청
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  const { presignedUrl, publicUrl } = await response.json();

  // 2. R2에 직접 업로드
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return publicUrl;
}
```

## 참고 문서

- [Better Auth 공식 문서](https://www.better-auth.com/docs)
- [Better Auth Next.js 통합](https://www.better-auth.com/docs/integrations/next)
- [Better Auth Drizzle 어댑터](https://www.better-auth.com/docs/adapters/drizzle)
- [Better Auth UI](https://better-auth-ui.com)
- [Neon 공식 문서](https://neon.tech/docs)
- [Neon Next.js 가이드](https://neon.com/docs/guides/nextjs)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team)
- [Cloudflare R2 공식 문서](https://developers.cloudflare.com/r2)

## TODO

- [ ] Next.js 16 proxy 마이그레이션 (`middleware.ts` → `proxy.ts`)
- [ ] 이메일 인증 설정
- [ ] 비밀번호 재설정 기능
- [ ] 프로필 이미지 업로드 연동
