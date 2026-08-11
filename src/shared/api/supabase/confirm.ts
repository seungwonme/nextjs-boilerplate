import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server.js";
import { getSupabaseEnv } from "../../config/index.ts";
import { getAuthSuccessUrl, getEmailOtpParams } from "./response.ts";

export async function handleAuthConfirmation(
  request: NextRequest,
  createClient: typeof createServerClient = createServerClient,
  resolveEnv: typeof getSupabaseEnv = getSupabaseEnv,
) {
  const code = request.nextUrl.searchParams.get("code");
  const emailOtp = getEmailOtpParams(request.url);

  if (!code && !emailOtp) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  const response = NextResponse.redirect(getAuthSuccessUrl(request.url));
  const { publishableKey, url } = resolveEnv();
  const supabase = createClient(url, publishableKey, {
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
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  } else if (emailOtp) {
    const { error } = await supabase.auth.verifyOtp(emailOtp);
    if (!error) return response;
  }

  return NextResponse.redirect(new URL("/auth/error", request.url));
}
