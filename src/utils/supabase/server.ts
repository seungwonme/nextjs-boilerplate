/**
 * @file server.ts
 * @description Supabase 서버 클라이언트 초기화 유틸리티
 *
 * 이 파일은 서버 측에서 Supabase 서비스에 접근하기 위한 클라이언트를 생성합니다.
 * 일반 클라이언트와 관리자 권한 클라이언트 두 가지 버전을 제공합니다.
 *
 * 주요 기능:
 * 1. 서버 컴포넌트에서 사용할 Supabase 클라이언트 생성
 * 2. 서버 액션에서 사용할 Supabase 클라이언트 생성
 * 3. 관리자 권한(service role)을 가진 Supabase 클라이언트 생성
 *
 * 구현 로직:
 * - Next.js의 cookies API를 사용하여 쿠키 관리
 * - createServerClient 함수를 사용하여 서버 환경에 최적화된 Supabase 클라이언트 생성
 * - 일반 사용자용 클라이언트는 익명 키 사용
 * - 관리자용 클라이언트는 서비스 롤 키 사용
 *
 * @dependencies
 * - @supabase/ssr
 * - next/headers
 */

"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}

/**
 * Supabase 관리자 클라이언트를 생성합니다. (Service Role)
 * 
 * 중요: 이 클라이언트는 `SUPABASE_SERVICE_ROLE` 키를 사용하며,
 * 모든 RLS(Row Level Security) 정책을 우회합니다.
 * 따라서 데이터베이스의 모든 테이블에 대한 전체 접근 권한을 갖습니다.
 * 
 * 이 클라이언트는 신뢰할 수 있는 서버 환경(예: 서버 액션, API 라우트의 특정 관리 작업)에서만
 * 제한적으로 사용해야 합니다. 클라이언트 측 코드나 안전하지 않은 환경에 노출되어서는 안 됩니다.
 * 
 * @returns {Promise<SupabaseClient>} 관리자 권한을 가진 Supabase 클라이언트 인스턴스
 * @throws {Error} 필요한 환경 변수가 설정되지 않은 경우 오류 발생
 */
export async function createServerSupabaseAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}
