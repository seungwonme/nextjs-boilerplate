"use client";

import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import { useParams } from "next/navigation";

export default function AuthPage() {
  const params = useParams();
  const path = (params?.path as string) ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthView path={path} />
    </main>
  );
}
