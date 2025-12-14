# Neon DB + Neon Auth + Cloudflare R2 통합 가이드

## 개요

- **Neon DB**: Serverless PostgreSQL 데이터베이스
- **Neon Auth**: Better Auth 기반 관리형 인증 서비스
- **Cloudflare R2**: S3 호환 오브젝트 스토리지

## 아키텍처

### Data API vs Server-side 방식

| 항목              | Data API                    | Server-side (현재 방식)                |
| ----------------- | --------------------------- | -------------------------------------- |
| **아키텍처**      | Client → Neon REST API → DB | Client → Next.js Server → Drizzle → DB |
| **JWT 검증**      | Neon이 자동 처리            | `neonAuth()`가 자동 처리               |
| **데이터 보안**   | RLS 정책 필수               | 서버 코드로 제어                       |
| **비즈니스 로직** | 클라이언트 또는 DB 함수     | 서버에서 자유롭게                      |
| **복잡한 쿼리**   | 제한적                      | Drizzle로 자유롭게                     |
| **유사 서비스**   | Supabase, Firebase          | 전통적인 백엔드                        |

**Data API**: 빠른 프로토타이핑, 단순 CRUD, RLS로 충분한 보안

**Server-side (현재 설정)**: 복잡한 비즈니스 로직, 외부 API 연동, 세밀한 접근 제어

## 설치

```bash
pnpm add @neondatabase/neon-js @neondatabase/serverless drizzle-orm
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add -D drizzle-kit
```

## 환경 변수

```bash
# Neon Database
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Neon Auth (Neon Console → Project → Branch → Auth → Configuration)
NEON_AUTH_BASE_URL="https://ep-xxx.neonauth.region.aws.neon.tech/dbname/auth"

# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-bucket.your-domain.com"
```

## Neon Console 설정

1. **Domains 추가**: `http://localhost:3000` (개발용)
2. **OAuth providers**: Google/GitHub 등 설정

### OAuth Shared Keys vs Custom Keys

| 항목             | Shared Keys (개발용)               | Custom Keys (프로덕션)       |
| ---------------- | ---------------------------------- | ---------------------------- |
| **용도**         | 개발/테스트 전용                   | 프로덕션                     |
| **동의 화면**    | "Stack Development" 표시           | 자체 앱 이름/브랜딩          |
| **계정 연동**    | 불가                               | 가능                         |
| **설정**         | 없음 (기본 제공)                   | OAuth 앱 생성 필요           |

**프로덕션 OAuth 설정 방법:**

1. Google/GitHub 개발자 콘솔에서 OAuth 앱 생성
2. Callback URL: Neon Console에서 확인 가능
3. Neon Console → Auth → OAuth providers에서 client_id, client_secret 입력

## Neon Auth 설정

### 1. API Route

```typescript
// app/api/auth/[...path]/route.ts
import { authApiHandler } from "@neondatabase/neon-js/auth/next";

export const { GET, POST } = authApiHandler();
```

### 2. Middleware

```typescript
// middleware.ts
import { neonAuthMiddleware } from "@neondatabase/neon-js/auth/next";

export default neonAuthMiddleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/settings/:path*"],
};
```

### 3. Auth Client

```typescript
// src/shared/lib/auth-client.ts
"use client";

import { createAuthClient } from "@neondatabase/neon-js/auth/next";

export const authClient = createAuthClient();
```

### 4. Auth Provider

```typescript
// src/features/auth/ui/auth-provider.tsx
"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={(path) => router.push(path)}
      replace={(path) => router.replace(path)}
      onSessionChange={() => router.refresh()}
      emailOTP
      social={{ providers: ["google"] }}
      redirectTo="/dashboard"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
```

### 5. CSS 설정

```css
/* app/globals.css */
@import "tailwindcss";
@import "@neondatabase/neon-js/ui/css";
```

### 6. Auth 페이지

```typescript
// app/auth/[path]/page.tsx
"use client";

import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import { useParams } from "next/navigation";

export default function AuthPage() {
  const params = useParams();
  const path = (params?.path as string) ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthView path={path} />
    </main>
  );
}
```

### 7. Account 페이지

```typescript
// app/account/[path]/page.tsx
"use client";

import { AccountView } from "@neondatabase/neon-js/auth/react/ui";
import { useParams } from "next/navigation";

export default function AccountPage() {
  const params = useParams();
  const path = (params?.path as string) ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AccountView path={path} />
    </main>
  );
}
```

## 사용 예시

### 클라이언트 컴포넌트

```tsx
"use client";

import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@neondatabase/neon-js/auth/react/ui";

export function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href="/auth/sign-in">Sign In</a>
      </SignedOut>
    </header>
  );
}
```

### Server Component

```tsx
import { neonAuth } from "@neondatabase/neon-js/auth/next";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { session, user } = await neonAuth();

  if (!session || !user) {
    redirect("/auth/sign-in");
  }

  return <div>Hello, {user.name}</div>;
}
```

### Server Action

```ts
"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next";
import { db } from "@/shared/api/db";

export async function createPost(formData: FormData) {
  const { user } = await neonAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await db.insert(posts).values({
    userId: user.id,
    title: formData.get("title") as string,
  });
}
```

### 파일 업로드 (R2)

```tsx
async function uploadFile(file: File) {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  const { presignedUrl, publicUrl } = await response.json();

  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return publicUrl;
}
```

## Neon Auth 스키마

Neon Auth가 `neon_auth` 스키마에 자동 생성하는 테이블:

| 테이블           | 설명            |
| ---------------- | --------------- |
| `user`           | 사용자 정보     |
| `session`        | 세션 정보       |
| `account`        | OAuth 계정 연동 |
| `verification`   | 이메일 인증     |
| `organization`   | 조직 정보       |
| `member`         | 조직 멤버       |
| `invitation`     | 초대            |

커스텀 테이블은 `public` 스키마에 Drizzle로 별도 관리합니다.

## 참고 문서

- [Neon Auth Next.js 가이드](https://neon.com/docs/auth/quick-start/nextjs)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team)
- [Cloudflare R2 공식 문서](https://developers.cloudflare.com/r2)
