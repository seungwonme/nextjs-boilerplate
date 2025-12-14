"use client";

import { LuLogOut } from "react-icons/lu";
import { Button } from "@/shared/ui";
import { signOut } from "../api/actions";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut()}
      className="gap-2"
    >
      <LuLogOut className="size-4" />
      Sign Out
    </Button>
  );
}
