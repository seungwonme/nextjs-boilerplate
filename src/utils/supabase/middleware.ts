/**
 * @file middleware.ts
 * @description Supabase 인증 미들웨어 유틸리티
 *
 * 이 파일은 Next.js 요청 처리 과정에서 Supabase 인증 세션을 업데이트하고
 * 라우트 보호 및 리다이렉션 기능을 구현합니다.
 *
 * 주요 기능:
 * 1. 요청마다 Supabase 세션 상태 확인 및 갱신
 * 2. 인증 상태에 따른 라우트 접근 제어
 * 3. 인증이 필요한 페이지에 대한 자동 리다이렉션
 * 4. 로그인된 사용자에 대한 /login 페이지 접근 시 홈 페이지로 리다이렉션
 *
 * 구현 로직:
 * - NextRequest, NextResponse를 사용한 요청/응답 처리
 * - Supabase 쿠키 관리 및 세션 유지
 * - 사용자 인증 상태 확인 및 라우트 가드 구현
 * - 경로별 조건부 리다이렉션 처리
 *
 * @dependencies
 * - @supabase/ssr
 * - next/server
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 기본 응답 설정
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase 클라이언트 초기화
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // 토큰 갱신 및 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 현재 경로 확인
  const path = request.nextUrl.pathname;

  // 이미 로그인된 사용자가 /login 페이지에 접근할 때 홈으로 리다이렉트
  if (path === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 사용자가 수정할 수 있는 보호된 라우트 목록
  // 예: const protectedRoutes = ['/profile', '/settings', '/dashboard'];
  const protectedRoutes = ['/profile']; 

  // 현재 경로가 보호된 라우트인지 확인
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // 인증이 필요한 페이지에 접근 시 로그인이 되어 있지 않으면 로그인 페이지로 리다이렉션
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 기본 응답 반환
  return response;
}
