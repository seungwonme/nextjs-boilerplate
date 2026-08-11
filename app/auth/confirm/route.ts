import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthSuccessUrl, getEmailOtpParams } from "@/shared/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const emailOtp = getEmailOtpParams(request.url);

  const response = NextResponse.redirect(getAuthSuccessUrl(request.url));

  const supabase = createServerClient(
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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  } else if (emailOtp) {
    const { error } = await supabase.auth.verifyOtp(emailOtp);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(new URL("/auth/error", request.url));
}
