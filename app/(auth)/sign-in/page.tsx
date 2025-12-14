"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthView view="SIGN_IN" />
    </div>
  );
}
