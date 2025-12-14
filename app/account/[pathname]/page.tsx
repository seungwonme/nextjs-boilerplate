"use client";

import { AccountView } from "@neondatabase/neon-js/auth/react/ui";
import { useParams } from "next/navigation";

export default function AccountPage() {
  const params = useParams();
  const pathname = (params?.pathname as string) ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AccountView pathname={pathname} />
    </div>
  );
}
