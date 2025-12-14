# Cloudflare R2 파일 스토리지 설정 가이드

## 개요

- **Cloudflare R2**: S3 호환 오브젝트 스토리지
- **Presigned URL**: 클라이언트에서 직접 업로드/다운로드
- **비공개 버킷**: 인증된 사용자만 접근 가능

## 설치

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 환경 변수

```bash
# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"

# 공개 버킷인 경우만 설정 (선택사항)
# R2_PUBLIC_URL="https://pub-xxx.r2.dev"
```

## Cloudflare Console 설정

### 1. R2 버킷 생성

1. **Cloudflare Dashboard** → **R2** → **Create bucket**
2. 버킷 이름 입력 후 생성

### 2. API 토큰 생성

1. **R2** → **Manage R2 API Tokens** → **Create API Token**
2. 권한: **Object Read & Write**
3. 버킷 선택 후 생성
4. `Access Key ID`, `Secret Access Key` 복사

### 3. CORS 설정 (필수)

**R2** → **버킷 선택** → **Settings** → **CORS Policy**

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Public Access 설정 (선택사항)

비공개 버킷을 권장하지만, 공개 필요시:

**방법 1: r2.dev 서브도메인**

1. **Settings** → **Public access** → **Allow Access**
2. `pub-xxx.r2.dev` URL 생성됨

**방법 2: Custom Domain**

1. **Custom Domains** → **Connect Domain**
2. `files.yourdomain.com` 같은 서브도메인 입력

## 파일 구조

```
src/
├── shared/api/
│   └── storage.ts              # R2 클라이언트 + presigned URL
├── features/upload/
│   ├── index.ts
│   ├── hooks/
│   │   └── use-file-upload.ts  # 업로드 훅 (진행률, 에러 처리)
│   └── ui/
│       ├── file-upload.tsx     # 드래그앤드롭 업로드 컴포넌트
│       └── file-preview.tsx    # 파일 프리뷰 컴포넌트
├── entities/file/
│   ├── index.ts
│   └── model/
│       └── schema.ts           # files 테이블 스키마
app/
├── api/
│   ├── upload/
│   │   └── route.ts            # POST: presigned URL 발급
│   └── files/
│       ├── route.ts            # GET: 목록, POST: 메타데이터 저장
│       └── [...key]/
│           └── route.ts        # GET: 다운로드, DELETE: 삭제
└── dashboard/
    └── page.tsx                # 파일 관리 페이지
```

## API 엔드포인트

| 메서드   | 경로               | 설명                                  |
| -------- | ------------------ | ------------------------------------- |
| `POST`   | `/api/upload`      | 업로드용 presigned URL 발급           |
| `GET`    | `/api/files`       | 사용자 파일 목록 조회                 |
| `POST`   | `/api/files`       | 파일 메타데이터 DB 저장               |
| `GET`    | `/api/files/[key]` | 파일 다운로드 (presigned URL 리다이렉트) |
| `DELETE` | `/api/files/[key]` | 파일 삭제 (R2 + DB)                   |

## 사용 예시

### FileUpload 컴포넌트 사용

```tsx
"use client";

import { FileUpload, type UploadedFile } from "@/features/upload";

export function ProfileForm() {
  const handleUploadComplete = (file: UploadedFile) => {
    console.log("업로드 완료:", file.publicUrl);
  };

  return (
    <FileUpload
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      multiple
      onUploadComplete={handleUploadComplete}
    />
  );
}
```

### FileUpload Props

| Prop               | 타입                                          | 설명                           |
| ------------------ | --------------------------------------------- | ------------------------------ |
| `accept`           | `string`                                      | 허용 파일 타입 (예: `image/*`) |
| `maxSize`          | `number`                                      | 최대 파일 크기 (bytes)         |
| `multiple`         | `boolean`                                     | 다중 파일 업로드 허용          |
| `disabled`         | `boolean`                                     | 비활성화 상태                  |
| `onUploadComplete` | `(file: UploadedFile) => void`                | 업로드 완료 콜백               |
| `onUploadError`    | `(file: UploadedFile, error: string) => void` | 업로드 에러 콜백               |
| `onFilesChange`    | `(files: UploadedFile[]) => void`             | 파일 목록 변경 콜백            |

### useFileUpload 훅 직접 사용

```tsx
"use client";

import { useFileUpload } from "@/features/upload";

export function CustomUploader() {
  const { files, isUploading, upload, removeFile } = useFileUpload({
    maxSize: 10 * 1024 * 1024,
    accept: ["image/*", ".pdf"],
    onUploadComplete: (file) => console.log("완료:", file.publicUrl),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await upload(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      {files.map((f) => (
        <div key={f.id}>
          {f.file.name} - {f.status} ({f.progress}%)
          <button onClick={() => removeFile(f.id)}>삭제</button>
        </div>
      ))}
    </div>
  );
}
```

### 수동 업로드 (API 직접 호출)

```tsx
async function uploadFile(file: File) {
  // 1. Presigned URL 발급
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  const { presignedUrl, key, publicUrl } = await response.json();

  // 2. R2에 직접 업로드
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  // 3. DB에 메타데이터 저장
  await fetch("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      name: file.name,
      key,
      type: file.type,
      size: file.size,
    }),
  });

  return publicUrl;
}
```

## 공개 vs 비공개 버킷

| 설정                   | 파일 접근 방식                                     |
| ---------------------- | -------------------------------------------------- |
| `R2_PUBLIC_URL` 없음   | `/api/files/[key]` → Presigned URL 리다이렉트      |
| `R2_PUBLIC_URL` 있음   | 공개 URL 직접 접근                                 |

**비공개 버킷 권장 이유:**

- 인증된 사용자만 파일 접근 가능
- 본인 파일만 조회/삭제 가능 (userId 체크)
- Presigned URL은 1시간 후 만료

## DB 스키마

```typescript
// src/entities/file/model/schema.ts
import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  type: text("type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

마이그레이션:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

## 트러블슈팅

### CORS 에러

```
Access to XMLHttpRequest has been blocked by CORS policy
```

→ Cloudflare R2 CORS 설정 확인

### Authorization 에러

```xml
<Error>
  <Code>InvalidArgument</Code>
  <Message>Authorization</Message>
</Error>
```

→ 비공개 버킷에서 직접 URL 접근 시도. `R2_PUBLIC_URL` 제거하고 presigned URL 사용

### 업로드 후 파일 안 보임

→ 페이지 새로고침 시 파일 사라짐: DB에 메타데이터 저장 필요 (이미 구현됨)

## 참고 문서

- [Cloudflare R2 공식 문서](https://developers.cloudflare.com/r2)
- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3)
