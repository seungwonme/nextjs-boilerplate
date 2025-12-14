# Neon DB + Neon Auth + Cloudflare R2 통합 가이드

## 개요

이 문서는 Next.js 16 보일러플레이트에 다음 기술 스택을 통합하는 방법을 설명합니다:

- **Neon DB**: Serverless PostgreSQL 데이터베이스
- **Neon Auth**: Better Auth 기반 관리형 인증 서비스
- **Cloudflare R2**: S3 호환 오브젝트 스토리지

## 인증 아키텍처 비교

### Data API vs Server-side 방식

| 항목              | Data API                    | Server-side (현재 방식)                |
| ----------------- | --------------------------- | -------------------------------------- |
| **아키텍처**      | Client → Neon REST API → DB | Client → Next.js Server → Drizzle → DB |
| **JWT 검증**      | Neon이 자동 처리            | JWKS로 직접 검증                       |
| **데이터 보안**   | RLS 정책 필수               | 서버 코드로 제어                       |
| **비즈니스 로직** | 클라이언트 또는 DB 함수     | 서버에서 자유롭게                      |
| **복잡한 쿼리**   | 제한적                      | Drizzle로 자유롭게                     |
| **개발 속도**     | 빠름 (백엔드 불필요)        | 보통                                   |
| **유연성**        | 낮음                        | 높음                                   |
| **유사 서비스**   | Supabase, Firebase          | 전통적인 백엔드                        |

#### 언제 뭘 쓰나?

**Data API 추천:**

- 빠른 프로토타이핑
- 단순 CRUD 앱
- RLS로 충분한 보안

**Server-side 추천 (현재 설정):**

- 복잡한 비즈니스 로직
- 외부 API 연동 필요
- 세밀한 접근 제어

## 설치된 패키지

```bash
# Neon DB + Drizzle ORM
pnpm add @neondatabase/serverless drizzle-orm
pnpm add -D drizzle-kit dotenv

# Neon Auth
pnpm add @neondatabase/neon-js jose

# Cloudflare R2 (AWS SDK v3)
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Neon Database
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Neon Auth
NEXT_PUBLIC_NEON_AUTH_URL="https://ep-xxx.neonauth.region.aws.neon.tech/dbname/auth"
NEON_AUTH_JWKS_URL="https://ep-xxx.neonauth.region.aws.neon.tech/dbname/auth/.well-known/jwks.json"

# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-bucket.your-domain.com"
```

### Neon Auth URL 확인

Neon Console → Auth 탭에서 확인:

- **Base URL**: `NEXT_PUBLIC_NEON_AUTH_URL`에 사용
- **JWKS URL**: `NEON_AUTH_JWKS_URL`에 사용

### Neon Console 설정

1. **Domains 추가**: `http://localhost:3000` (개발용)
2. **OAuth providers**: Google/GitHub 등 설정 (Shared keys 사용 가능)

## 파일 구조

```
src/
├── shared/
│   ├── api/
│   │   ├── db.ts              # Drizzle + Neon 클라이언트
│   │   └── storage.ts         # R2 클라이언트
│   └── lib/
│       ├── auth-client.ts     # Neon Auth 클라이언트
│       └── auth-server.ts     # 서버 JWT 검증
│
├── features/
│   └── auth/
│       ├── ui/
│       │   └── auth-provider.tsx  # NeonAuthUIProvider
│       └── index.ts
│
├── entities/
│   └── user/
│       ├── model/
│       │   └── schema.ts      # Drizzle 스키마 (커스텀 테이블용)
│       └── index.ts
│
└── app/
    └── providers.tsx          # AuthProvider 래퍼

app/
├── api/
│   ├── me/
│   │   └── route.ts           # 보호된 API 예제
│   └── upload/
│       └── route.ts           # R2 Presigned URL API
├── (auth)/
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── account/
│   └── [pathname]/page.tsx    # 계정 관리 페이지
└── layout.tsx                 # Providers 적용

middleware.ts                  # 인증 미들웨어
drizzle.config.ts              # Drizzle Kit 설정
```

## 주요 파일 설명

### 1. 데이터베이스 (Neon + Drizzle)

**`src/shared/api/db.ts`**

Neon Serverless 드라이버와 Drizzle ORM을 사용한 데이터베이스 클라이언트입니다.

**`src/entities/user/model/schema.ts`**

커스텀 테이블 스키마 (Neon Auth 테이블은 `neon_auth` 스키마에서 자동 관리):

- 사용자 관련 추가 테이블 정의
- `public` 스키마에 생성

### 2. 인증 (Neon Auth)

**`src/shared/lib/auth-client.ts`**

클라이언트 측 Neon Auth 설정:

```ts
import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(
  process.env.NEXT_PUBLIC_NEON_AUTH_URL!,
);
```

**`src/shared/lib/auth-server.ts`**

서버 측 JWT 검증:

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

// 세션 조회 (Server Component / Server Action)
export async function getSession(): Promise<AuthSession | null>;

// 토큰 검증 (API Route - Authorization 헤더)
export async function verifyToken(
  request: Request,
): Promise<AuthSession | null>;

// 인증 필수 (미인증시 에러)
export async function requireAuth(): Promise<AuthSession>;
```

**`src/features/auth/ui/auth-provider.tsx`**

```tsx
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';
import '@neondatabase/neon-js/ui/css';
```

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

- 보호된 경로: `/dashboard`, `/profile`, `/settings`, `/account`
- 인증 경로: `/sign-in`, `/sign-up`

## 사용 예시

### 클라이언트 컴포넌트

```tsx
'use client';

import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@neondatabase/neon-js/auth/react/ui';

export function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href="/sign-in">Sign In</a>
      </SignedOut>
    </header>
  );
}
```

### Server Component

```tsx
import { getSession } from '@/shared/lib';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  return <div>Hello, {session.user.name}</div>;
}
```

### Server Action

```ts
'use server';

import { requireAuth } from '@/shared/lib';
import { db } from '@/shared/api/db';

export async function createPost(formData: FormData) {
  const session = await requireAuth();

  // session.user.id로 DB 작업
  await db.insert(posts).values({
    userId: session.user.id,
    title: formData.get('title') as string,
  });
}
```

### API Route

```ts
import { NextResponse } from 'next/server';
import { getSession } from '@/shared/lib';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
```

### 파일 업로드 (클라이언트)

```tsx
async function uploadFile(file: File) {
  // 1. Presigned URL 요청
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  const { presignedUrl, publicUrl } = await response.json();

  // 2. R2에 직접 업로드
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return publicUrl;
}
```

## Neon Auth 스키마

Neon Auth가 `neon_auth` 스키마에 자동으로 생성하는 테이블:

| 테이블           | 설명            |
| ---------------- | --------------- |
| `user`           | 사용자 정보     |
| `session`        | 세션 정보       |
| `account`        | OAuth 계정 연동 |
| `verification`   | 이메일 인증     |
| `organization`   | 조직 정보       |
| `member`         | 조직 멤버       |
| `invitation`     | 초대            |
| `jwks`           | JWT 키          |
| `project_config` | 프로젝트 설정   |

커스텀 테이블은 `public` 스키마에 Drizzle로 별도 관리합니다.

## 참고 문서

- [Neon Auth 공식 문서](https://neon.tech/docs/guides/neon-auth)
- [Neon 공식 문서](https://neon.tech/docs)
- [Neon Next.js 가이드](https://neon.com/docs/guides/nextjs)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team)
- [Cloudflare R2 공식 문서](https://developers.cloudflare.com/r2)

## TODO

- [ ] 프로필 이미지 업로드 연동
- [ ] 대시보드 페이지 구현
- [ ] 커스텀 테이블 마이그레이션
