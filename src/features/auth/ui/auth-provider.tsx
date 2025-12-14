"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";
import "@neondatabase/neon-js/ui/css";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={(path) => router.push(path)}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
