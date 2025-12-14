import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/shared/api/supabase/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const _next = searchParams.get("next");

  // Validate redirect URL to prevent open redirect vulnerability
  const next = _next?.startsWith("/") && !_next.startsWith("//") ? _next : "/";

  // Create response to properly set cookies
  const redirectUrl = new URL(next, request.url);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Handle PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", encodeURIComponent(error.message));
    return NextResponse.redirect(errorUrl);
  }

  // Handle email OTP flow (token_hash parameter)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return response;
    }
    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", encodeURIComponent(error.message));
    return NextResponse.redirect(errorUrl);
  }

  // No valid parameters provided
  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set(
    "error",
    encodeURIComponent("No valid confirmation parameters"),
  );
  return NextResponse.redirect(errorUrl);
}
