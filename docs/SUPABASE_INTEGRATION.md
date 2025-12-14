# Supabase Integration Guide

이 프로젝트는 Next.js 16과 Supabase를 통합하여 인증(Auth), 스토리지(Storage), 데이터베이스(DB with RLS)를 구현합니다.

## 📦 설치된 패키지

- `@supabase/ssr` - SSR을 위한 Supabase 클라이언트
- `@supabase/supabase-js` - Supabase JavaScript 클라이언트

## 🔧 설정

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 추가하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"

# Supabase CLI (for migrations)
SUPABASE_ACCESS_TOKEN="your-access-token"
SUPABASE_PROJECT_REF="your-project-ref"
```

### 2. Supabase 프로젝트 연결

```bash
# Supabase 프로젝트 링크
pnpm dlx supabase link --project-ref your-project-ref

# 마이그레이션 실행 (로컬)
pnpm dlx supabase db push

# 원격 데이터베이스에 마이그레이션 적용
pnpm dlx supabase db push --db-url "postgresql://..."
```

### 3. Supabase Dashboard 설정

Supabase Dashboard에서 다음 설정을 확인하세요:

1. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (또는 프로덕션 URL)
   - Redirect URLs 추가:
     - `http://localhost:3000/auth/login`
     - `http://localhost:3000/auth/confirm`
     - (프로덕션 URL도 추가)

2. **Authentication → Email Templates**
   - Confirm signup 템플릿을 다음과 같이 수정:
     - `{{ .SiteURL }}/auth/confirm?code={{ .Token }}`
   - Magic Link 템플릿도 동일하게 수정:
     - `{{ .SiteURL }}/auth/confirm?code={{ .Token }}`

### 4. 타입 생성

```bash
# TypeScript 타입 생성
pnpm dlx supabase gen types typescript --local > src/shared/api/supabase/types.ts

# 원격 데이터베이스에서 타입 생성
pnpm dlx supabase gen types typescript --project-id your-project-ref > src/shared/api/supabase/types.ts
```

## 🏗️ 아키텍처

### FSD (Feature-Sliced Design) 구조

```
src/
├── shared/
│   ├── api/
│   │   └── supabase/          # Supabase 클라이언트 설정
│   │       ├── client.ts       # 브라우저 클라이언트
│   │       ├── server.ts       # 서버 클라이언트
│   │       ├── middleware.ts   # 미들웨어 클라이언트
│   │       ├── types.ts        # 데이터베이스 타입
│   │       └── index.ts
│   └── lib/
│       └── dal.ts             # Data Access Layer (인증 검증)
├── features/
│   ├── auth/                  # 인증 기능
│   │   ├── api/
│   │   │   └── actions.ts     # Server Actions
│   │   ├── ui/
│   │   │   ├── sign-in-form.tsx
│   │   │   ├── sign-up-form.tsx
│   │   │   └── sign-out-button.tsx
│   │   └── index.ts
│   └── upload-avatar/         # 아바타 업로드 기능
│       ├── api/
│       │   └── actions.ts
│       ├── ui/
│       │   └── avatar-upload.tsx
│       └── index.ts
└── entities/
    └── user/                  # 사용자 엔티티
        ├── api/
        │   └── profile.ts
        ├── model/
        │   └── types.ts
        ├── ui/
        │   └── user-avatar.tsx
        └── index.ts
```

## 📚 주요 기능

### 1. 인증 (Authentication)

#### 이메일 로그인

```tsx
import { SignInForm } from '@/features/auth';

export default function LoginPage() {
  return <SignInForm />;
}
```

#### 회원가입

```tsx
import { SignUpForm } from '@/features/auth';

export default function SignUpPage() {
  return <SignUpForm />;
}
```

#### 로그아웃

```tsx
import { SignOutButton } from '@/features/auth';

export default function Header() {
  return <SignOutButton />;
}
```

#### 서버에서 사용자 정보 가져오기

```tsx
import { getUser } from '@/features/auth';

export default async function ProfilePage() {
  const { user, error } = await getUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### 2. 스토리지 (Storage)

#### 아바타 업로드

```tsx
import { AvatarUpload } from '@/features/upload-avatar';
import { UserAvatar } from '@/entities/user';

export default function ProfilePage({ userId, profile }) {
  return (
    <div>
      <UserAvatar profile={profile} />
      <AvatarUpload
        userId={userId}
        currentAvatarUrl={profile?.avatar_url}
        onUploadComplete={(url) => console.log('Uploaded:', url)}
      />
    </div>
  );
}
```

### 3. 데이터베이스 (Database)

#### 프로필 조회

```tsx
import { getProfile } from '@/entities/user';

export default async function ProfilePage({ userId }) {
  const { profile, error } = await getProfile(userId);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>@{profile.username}</p>
      <a href={profile.website}>{profile.website}</a>
    </div>
  );
}
```

#### 프로필 업데이트

```tsx
import { updateProfile } from '@/entities/user';

async function handleUpdate(userId: string) {
  const { profile, error } = await updateProfile(userId, {
    username: 'newusername',
    full_name: 'New Name',
    website: 'https://example.com',
  });

  if (error) {
    console.error(error);
    return;
  }

  console.log('Updated:', profile);
}
```

## 🛡️ DAL (Data Access Layer)

### 세션 검증

모든 Server Component와 Server Action에서 `verifySession()`을 사용하여 인증 상태를 확인합니다:

```tsx
import { verifySession } from '@/shared/lib';

export default async function ProtectedPage() {
  const { isAuth, user } = await verifySession();

  if (!isAuth) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### 인증 강제

인증이 필수인 경우 `requireAuth()`를 사용합니다:

```tsx
import { requireAuth } from '@/shared/lib';

export default async function ProtectedPage() {
  const user = await requireAuth(); // 인증되지 않으면 에러 발생

  return <div>Welcome, {user.email}</div>;
}
```

### Server Actions 인증 패턴

모든 Server Actions는 다음 패턴을 따릅니다:

```tsx
'use server';

import { verifySession } from '@/shared/lib';
import { createServerClient } from '@/shared/api/supabase';

export async function someAction(formData: FormData) {
  // 1. 인증 확인
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    return { error: "Unauthorized" };
  }

  // 2. 권한 확인 (필요한 경우)
  const resourceId = formData.get('resourceId') as string;
  if (user.id !== resourceId) {
    return { error: "Forbidden" };
  }

  // 3. 비즈니스 로직 실행
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) {
    return { error: error.message };
  }

  return { data, error: null };
}
```

## 🔒 보안 (Row Level Security)

### Profiles 테이블 RLS 정책

1. **Public profiles are viewable by everyone**: 모든 사용자가 프로필을 조회할 수 있습니다.
2. **Users can insert their own profile**: 사용자는 자신의 프로필만 생성할 수 있습니다.
3. **Users can update own profile**: 사용자는 자신의 프로필만 수정할 수 있습니다.

### Storage RLS 정책

1. **Avatar images are publicly accessible**: 아바타 이미지는 누구나 조회할 수 있습니다.
2. **Anyone can upload an avatar**: 인증된 사용자는 아바타를 업로드할 수 있습니다.
3. **Users can update their own avatar**: 사용자는 자신의 아바타만 수정할 수 있습니다.
4. **Users can delete their own avatar**: 사용자는 자신의 아바타만 삭제할 수 있습니다.

## 🔄 자동 트리거

### 사용자 생성 시 프로필 자동 생성

사용자가 회원가입하면 `handle_new_user()` 함수가 자동으로 실행되어 `profiles` 테이블에 새로운 레코드를 생성합니다.

```sql
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
```

## 🛠️ 클라이언트 사용법

### 브라우저 클라이언트 (Client Component)

```tsx
'use client';

import { createClient } from '@/shared/api/supabase';

export function MyComponent() {
  const supabase = createClient();

  // 사용 예시
  async function fetchData() {
    const { data, error } = await supabase.from('profiles').select('*');
  }
}
```

### 서버 클라이언트 (Server Component / Server Action)

```tsx
import { createServerClient } from '@/shared/api/supabase';

export async function MyServerComponent() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.from('profiles').select('*');

  return <div>...</div>;
}
```

## 📝 마이그레이션

### 새 마이그레이션 생성

```bash
pnpm dlx supabase migration new migration_name
```

### 마이그레이션 적용

```bash
# 로컬
pnpm dlx supabase db push

# 원격
pnpm dlx supabase db push --db-url "postgresql://..."
```

### 마이그레이션 리셋

```bash
pnpm dlx supabase db reset
```

## 🔍 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js SSR with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [@supabase/ssr 문서](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth UI](https://supabase.com/ui/docs/nextjs/client)
