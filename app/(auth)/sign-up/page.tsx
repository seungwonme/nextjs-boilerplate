"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthView view="SIGN_UP" />
    </div>
  );
}
