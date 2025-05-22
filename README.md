# Next.js + Supabase 보일러플레이트

최신 Next.js와 Supabase를 활용한 풀스택 개발을 위한 보일러플레이트입니다.

## 주요 기능

- 🔐 **Supabase Auth**: 이메일/비밀번호 인증 및 OAuth 지원
- 💾 **Supabase Storage**: 파일 업로드 및 관리
- 🏗️ **Next.js 앱 라우터**: 최신 Next.js 앱 라우터 구조 사용
- 🎨 **ShadcnUI + TailwindCSS**: 현대적이고 커스터마이징 가능한 UI 컴포넌트
- 🌓 **다크 모드**: 사용자 선호에 따른 테마 전환 지원
- 📱 **반응형 디자인**: 모바일부터 데스크탑까지 최적화된 UI
- 🔍 **SEO 최적화**: 메타데이터, 구조화된 데이터, sitemap.xml, robots.txt 자동 생성
- 📝 **서버 액션**: Next.js 서버 액션을 활용한 폼 처리 및 파일 업로드
- 🔒 **보호된 라우트**: 인증 상태에 따른 라우트 보호 구현

## 기술 스택

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/) (Auth, Storage)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)

## 시작하기

### 사전 요구사항

- Node.js 18.17.0 이상
- pnpm 8.0.0 이상
- Supabase 프로젝트 (Auth 및 Storage 활성화)

### 설치

1. 저장소 클론

```bash
git clone https://github.com/your-username/boilerplate.git my-project
cd my-project
```

2. 의존성 설치

```bash
pnpm install
```

3. 환경 변수 설정

`.env.example` 파일을 `.env` 파일로 복사하고 필요한 환경 변수를 설정합니다.

```bash
cp .env.example .env
```

`.env` 파일에 다음과 같이 환경 변수를 설정합니다:

```
NEXT_PUBLIC_SUPABASE_URL="https://project_id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
NEXT_PUBLIC_STORAGE_BUCKET="your_storage_bucket_name" # 스토리지 버킷 이름

NEXT_PUBLIC_SITE_URL="http://localhost:3000" # 개발 환경 또는 배포 URL

SUPABASE_SERVICE_ROLE="your_supabase_service_role"
SUPABASE_DB_PASSWORD="your_supabase_db_password"

```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `NEXT_PUBLIC_STORAGE_BUCKET`: Supabase 스토리지 버킷 이름 (예: `test-bucket`)
- `NEXT_PUBLIC_SITE_URL`: 배포할 사이트 URL (개발 시 `http://localhost:3000`)
- `SUPABASE_SERVICE_ROLE`: Supabase 서비스 롤 키 (관리자 권한)

**⚠️ 중요: `SUPABASE_SERVICE_ROLE` 사용 시 주의사항**

`SUPABASE_SERVICE_ROLE` 키는 Supabase 프로젝트의 모든 데이터에 접근하고 모든 RLS(Row Level Security) 정책을 우회할 수 있는 관리자 권한 키입니다. 
이 키는 다음과 같은 경우에만 매우 신중하게 사용해야 합니다:
- 서버 측 로직 (예: Next.js 서버 액션, API 라우트)
- 보안된 서버리스 함수
- 데이터베이스 마이그레이션 또는 관리 스크립트

**절대로 클라이언트 측 코드나 브라우저 환경에 이 키를 노출해서는 안 됩니다.** 
보안 침해 시 심각한 데이터 유출 및 조작이 발생할 수 있습니다. 
일반적인 사용자 데이터 접근에는 항상 익명 키(`NEXT_PUBLIC_SUPABASE_ANON_KEY`)를 사용하고 RLS 정책을 통해 데이터 접근을 제어하세요.
- `SUPABASE_DB_PASSWORD`: Supabase 데이터베이스 비밀번호

### 개발 서버 실행

```bash
pnpm dev
```

이제 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/)에 로그인하고 새 프로젝트를 생성합니다.
2. 프로젝트 생성 후 프로젝트 설정에서 API URL과 익명 키를 찾아 `.env` 파일에 설정합니다.

### 2. 인증 설정

1. Supabase 대시보드에서 Authentication > Settings로 이동합니다.
2. Site URL을 설정합니다 (배포된 URL 또는 개발 환경에서는 `http://localhost:3000`).
3. OAuth 제공업체를 설정하려면 Authentication > Providers로 이동하여 원하는 제공업체를 활성화합니다.
4. Redirect URLs에 `{SITE_URL}/auth/callback`을 추가합니다.

### 3. 스토리지 설정

1. Supabase 대시보드에서 Storage로 이동합니다.
2. "Create a new bucket"을 클릭하여 새 버킷을 생성합니다.
3. 버킷 이름을 `.env` 파일의 `NEXT_PUBLIC_STORAGE_BUCKET`에 설정한 이름과 동일하게 지정합니다 (예: `test-bucket`).
4. **Public access**를 활성화합니다. (이 보일러플레이트는 공개 버킷을 기준으로 작성되었습니다.)
5. (선택 사항) 스토리지 정책(Policies)을 설정하여 파일 접근 권한을 세밀하게 제어할 수 있습니다. 기본적으로 공개 버킷은 모든 사용자가 파일을 읽을 수 있습니다. 파일 업로드 및 삭제는 보일러플레이트의 서버 액션을 통해 처리됩니다.

## 스토리지 보안 고려사항 (Storage Security Considerations)

이 보일러플레이트는 Supabase Storage를 사용하여 파일 업로드 및 관리를 지원합니다. 기본 설정에서는 편의를 위해 공개(public) 버킷을 사용하도록 안내하고 있습니다. 공개 버킷은 버킷 내의 모든 객체에 대해 공개적인 읽기 접근을 허용합니다.

### 공개 버킷의 의미

- **읽기 접근**: 버킷이 공개로 설정되면, 해당 버킷 내 파일의 URL을 아는 사람은 누구나 파일을 읽거나 다운로드할 수 있습니다. 인증이나 추가적인 권한 확인이 필요하지 않습니다.
- **쓰기/삭제 접근**: 이 보일러플레이트에서는 파일 업로드, 수정, 삭제는 인증된 사용자에 한해 서버 액션(`src/actions/storage.ts`)을 통해서만 이루어지도록 구현되어 있습니다. 이는 직접적인 클라이언트 측 쓰기 접근을 방지하여 기본적인 보안을 제공합니다.

### 스토리지 접근 제어 강화 (RLS 정책 활용)

모든 사용자에게 파일을 공개하고 싶지 않거나, 사용자별 또는 조건별로 파일 접근 권한을 세밀하게 제어해야 하는 경우 Supabase의 RLS(Row Level Security) 정책을 스토리지에 적용해야 합니다.

**RLS 정책을 사용하면 다음과 같은 규칙을 설정할 수 있습니다:**
- 사용자는 자신의 파일만 보거나 다운로드할 수 있습니다.
- 특정 역할을 가진 사용자만 특정 폴더의 파일에 접근할 수 있습니다.
- 특정 조건을 만족하는 파일만 공개적으로 접근 가능하게 설정할 수 있습니다.

**RLS 정책 설정 방법:**

1.  **버킷을 비공개(private)로 설정**: Supabase 대시보드에서 해당 스토리지 버킷의 "Public access"를 비활성화합니다.
2.  **스토리지 정책(Policies) 생성**: Supabase 대시보드의 "Storage" > "Policies" 섹션에서 테이블에 RLS 정책을 설정하듯이 스토리지 객체에 대한 정책을 작성합니다.
    - `storage.objects` 테이블에 대해 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 권한에 대한 정책을 정의할 수 있습니다.
    - 예를 들어, 사용자가 자신의 `user_id`와 일치하는 폴더 내의 파일만 읽을 수 있도록 하려면 `SELECT` 정책을 다음과 같이 설정할 수 있습니다:
      ```sql
      -- 사용자는 자신의 user_id와 이름이 같은 폴더 내의 파일만 볼 수 있습니다.
      CREATE POLICY "User can view own files"
      ON storage.objects FOR SELECT
      USING ( auth.uid()::text = (storage.foldername(name))[1] );
      -- 참고: 위 정책은 파일 경로의 첫 번째 폴더 이름이 user_id와 같다고 가정합니다.
      -- 예: /user_id_123/image.png
      ```
    - 파일 업로드 시 `INSERT` 정책은 사용자가 특정 경로에만 업로드하도록 제한할 수 있습니다.
      ```sql
      -- 사용자는 자신의 user_id와 이름이 같은 폴더에만 파일을 업로드할 수 있습니다.
      CREATE POLICY "User can upload to own folder"
      ON storage.objects FOR INSERT
      WITH CHECK ( auth.uid()::text = (storage.foldername(name))[1] );
      ```

3.  **서버 액션 확인**: `src/actions/storage.ts`의 파일 관련 로직(특히 파일 URL 생성 또는 접근)이 비공개 버킷 및 RLS 정책과 호환되는지 확인해야 할 수 있습니다. 예를 들어, 비공개 파일에 접근하려면 Supabase 클라이언트에서 `createSignedUrl`과 같은 함수를 사용하여 특정 시간 동안만 유효한 URL을 생성해야 할 수 있습니다. 이 보일러플레이트의 `src/utils/supabase/storage.ts`에 있는 `getPublicUrl`은 공개 버킷을 가정하므로, 비공개 버킷 사용 시에는 `createSignedUrl` 등으로 대체해야 합니다.

**자세한 정보는 Supabase 공식 문서를 참고하세요:**
- [Supabase Storage 접근 제어](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage RLS 정책 예시](https://supabase.com/docs/guides/storage/security/rls-policies-examples)

애플리케이션의 요구사항에 맞춰 스토리지 보안 설정을 적절히 구성하는 것이 중요합니다.

## 데이터베이스 타입 생성 (Type Generation)

이 보일러플레이트는 Supabase 데이터베이스 스키마로부터 TypeScript 타입을 생성하여 코드 안정성과 개발자 경험을 향상시키는 기능을 제공합니다. 생성된 타입은 `src/types/database.types.ts` 파일에 저장됩니다.

### 1. Supabase CLI 설치 및 로그인

아직 Supabase CLI를 설치하지 않았다면, 다음 명령어로 설치하세요:

```bash
npm install supabase --save-dev
```
또는 전역으로 설치할 수 있습니다:
```bash
npm install -g supabase
```

설치 후 Supabase에 로그인합니다:

```bash
npx supabase login
```

### 2. 프로젝트 ID 확인 및 설정

Supabase 프로젝트 대시보드에서 프로젝트 ID를 확인하세요. (URL이 `https://<project_id>.supabase.co` 형식인 경우 `<project_id>` 부분입니다.)

`package.json` 파일의 `scripts` 섹션에 있는 `supabase:types` 명령어를 수정하여 `YOUR_PROJECT_ID_HERE` 부분을 실제 프로젝트 ID로 변경해야 합니다.

예시:
```json
// package.json
"scripts": {
  // ... 다른 스크립트들 ...
  "supabase:types": "supabase gen types typescript --project-id 실제프로젝트ID > src/types/database.types.ts"
},
```

또는, 환경 변수 `SUPABASE_PROJECT_ID`를 설정하고 스크립트를 다음과 같이 수정할 수도 있습니다:
`"supabase:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.types.ts"`


### 3. 타입 생성 실행

다음 명령어를 실행하여 데이터베이스 타입을 생성합니다:

```bash
pnpm supabase:types
```
(또는 `npm run supabase:types` / `yarn supabase:types`)

이 명령어는 `src/types/database.types.ts` 파일을 Supabase 데이터베이스 스키마를 기반으로 덮어씁니다.
데이터베이스 스키마 변경 시 (테이블, 컬럼, 함수 등 추가/수정) 이 명령어를 다시 실행하여 타입을 최신 상태로 유지하세요.

### 4. 생성된 타입 활용

생성된 타입은 Supabase 클라이언트와 함께 사용하여 쿼리 결과 및 입력에 대한 타입 안전성을 확보할 수 있습니다.

```typescript
// 예시: Supabase 클라이언트와 타입 함께 사용하기
import { createServerSupabaseClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types'; // 생성된 타입 import

async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient(); // 타입 지정은 createServerSupabaseClient<Database>() 와 같이 가능
  const { data, error } = await supabase
    .from('profiles') // 'profiles' 테이블이 있다고 가정
    .select('*')
    .eq('id', userId)
    .single<Database['public']['Tables']['profiles']['Row']>(); // Row 타입 사용

  if (error) throw error;
  return data;
}
```
이와 같이 타입을 활용하면 개발 중 실수를 줄이고 자동 완성을 통해 생산성을 높일 수 있습니다.
`src/types/schema.ts`의 Zod 스키마와 함께 사용하거나, Zod 스키마를 생성된 DB 타입으로부터 파생시키는 방법도 고려할 수 있습니다.

## 프로젝트 구조

```
src/
├── actions/                # Next.js 서버 액션 (auth.ts, storage.ts)
├── app/                    # Next.js 앱 라우터
│   ├── auth/               # 인증 관련 라우트 (callback, error)
│   ├── login/              # 로그인 페이지 (layout.tsx, page.tsx)
│   ├── profile/            # 프로필 페이지 (layout.tsx, page.tsx)
│   ├── globals.css         # 전역 스타일
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈페이지 (파일 업로드/리스트)
│   ├── favicon.ico         # 파비콘
│   ├── manifest.ts         # PWA 매니페스트
│   ├── not-found.tsx       # 404 페이지
│   ├── robots.ts           # robots.txt 생성
│   └── sitemap.ts          # sitemap.xml 생성
├── components/             # 재사용 가능한 컴포넌트
│   ├── auth/               # 인증 UI 컴포넌트 (buttons.tsx 등)
│   ├── nav/                # 네비게이션 컴포넌트 (navbar.tsx 등)
│   ├── seo/                # SEO 관련 컴포넌트 (JsonLd.tsx)
│   ├── storage/            # 스토리지 관련 UI 컴포넌트
│   │   ├── file-uploader.tsx # 파일 업로드 컴포넌트
│   │   └── file-list.tsx     # 파일 목록 컴포넌트
│   └── ui/                 # Shadcn UI 컴포넌트 (button.tsx, input.tsx 등)
├── hooks/                  # 커스텀 훅 (use-mobile.ts)
├── lib/                    # 라이브러리 유틸리티 (utils.ts - Shadcn)
├── middleware.ts           # Next.js 미들웨어 (라우트 보호)
├── types/                  # TypeScript 타입 정의 (schema.ts)
└── utils/                  # 유틸리티 함수
    ├── seo/                # SEO 유틸리티 (constants.ts, metadata.ts)
    └── supabase/           # Supabase 클라이언트 (client.ts, server.ts, middleware.ts, storage.ts)
```

## 주요 기능 사용법

## 라우트 보호

`src/middleware.ts`는 `src/utils/supabase/middleware.ts`의 `updateSession` 함수를 호출하여 라우트 보호를 처리합니다. 
인증되지 않은 사용자가 보호된 경로에 접근하려고 하면 로그인 페이지(`/login`)로 리디렉션됩니다.

보호할 경로는 `src/utils/supabase/middleware.ts` 파일 내의 `updateSession` 함수 안에 있는 `protectedRoutes` 배열을 수정하여 설정할 수 있습니다.

예시:
```typescript
// src/utils/supabase/middleware.ts

// ... 코드 상단 ...

export async function updateSession(request: NextRequest) {
  // ... 생략 ...

  // 사용자가 수정할 수 있는 보호된 라우트 목록
  // 예: const protectedRoutes = ['/profile', '/settings', '/dashboard'];
  const protectedRoutes = ['/profile']; // 이 배열을 수정하여 보호할 경로를 추가하거나 변경하세요.

  // 현재 경로가 보호된 라우트인지 확인
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // 인증이 필요한 페이지에 접근 시 로그인이 되어 있지 않으면 로그인 페이지로 리다이렉션
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ... 생략 ...
}
```
기본적으로 `/profile` 경로가 보호 설정되어 있습니다. 
필요에 따라 이 배열에 경로를 추가하거나 기존 경로를 수정하여 애플리케이션의 접근 제어를 관리하세요. 
경로는 `startsWith`를 사용하여 매칭되므로, `/admin`을 추가하면 `/admin/users`, `/admin/settings` 등 하위 경로도 모두 보호됩니다.

### 인증 컴포넌트

로그인 및 회원가입 기능은 `src/app/login/page.tsx`에 구현되어 있습니다. 이 페이지는 서버 액션(`src/actions/auth.ts`)을 사용하여 인증 로직을 처리합니다.

### 파일 업로드 및 관리

파일 업로드 및 목록 표시는 홈페이지(`src/app/page.tsx`)에서 처리됩니다.

- `src/components/storage/file-uploader.tsx`: 파일 업로드를 위한 UI 컴포넌트입니다. `src/app/page.tsx`에서 사용됩니다.
- `src/components/storage/file-list.tsx`: 업로드된 파일 목록을 표시하기 위한 UI 컴포넌트입니다. `src/app/page.tsx`에서 사용됩니다.
- 파일 업로드는 `src/actions/storage.ts` 서버 액션을 사용합니다.
- Supabase Storage 유틸리티는 `src/utils/supabase/storage.ts`에 있습니다.

### SEO 최적화

`src/utils/seo` 디렉토리의 유틸리티 함수를 사용하여 페이지별 메타데이터를 설정할 수 있습니다.

```typescript
// 페이지 메타데이터 설정 예시
import { createMetadata } from "@/utils/seo/metadata";

export const metadata = createMetadata({
  title: "페이지 제목",
  description: "페이지 설명",
  noIndex: false, // 검색 엔진 색인 여부
});
```

## Vercel 배포

이 프로젝트는 [Vercel](https://vercel.com/)에 쉽게 배포할 수 있습니다.

1. GitHub 저장소를 Vercel에 연결합니다.
2. 환경 변수를 설정합니다. (`.env` 파일 내용 참고)
3. 배포를 시작합니다.

## 고급 기능 (Advanced Features)

### MCP(Model Context Protocol) 설정

이 섹션은 AI 기반 개발 도구와의 통합을 위한 고급 설정입니다. 대부분의 사용자에게는 필요하지 않을 수 있습니다.

이 프로젝트는 AI 기반 개발 도구를 위한 MCP 서버 설정을 포함하고 있습니다. `.cursor/mcp.json` 파일에서 설정을 확인할 수 있습니다:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-sequential-thinking"]
    },
    "context7": {
      "command": "bunx",
      "args": ["@upstash/context7-mcp"]
    },
    "supabase": {
      "command": "bunx",
      "args": [
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        // 보안 주의: Supabase 액세스 토큰은 민감한 정보입니다. 이 토큰은 Supabase 프로젝트에 대한 광범위한 접근 권한을 부여할 수 있으므로 안전하게 관리해야 하며, 공개 저장소나 클라이언트 측 코드에 직접 포함해서는 안 됩니다. 환경 변수나 안전한 저장소를 사용하는 것을 권장합니다.
        "your_supabase_access_token" // 실제 Supabase 액세스 토큰으로 변경
      ]
    }
  }
}
```

Supabase MCP 서버를 사용하려면 `your_supabase_access_token`을 실제 액세스 토큰으로 변경해야 합니다.
