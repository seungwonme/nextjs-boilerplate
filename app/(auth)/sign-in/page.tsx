"use client";

import { AuthView } from "@neondatabase/neon-js/auth/react/ui";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthView pathname="sign-in" />
    </div>
  );
}
